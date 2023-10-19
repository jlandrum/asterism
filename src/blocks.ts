import chalk from "chalk";
import animate from 'chalk-animation';

import { mkdirsSync, readFileSync, readdirSync } from "fs-extra";
import { getTheme, getThemeDestination } from "./asterism";
import { buildFunctionsPhp } from "./files";
import { sync as resolveBin } from 'resolve-bin';

const { log, warn, error } = console;

function watchBlock(name: string, verbose?: boolean,) {
	const indicator = animate.rainbow('Watching block ' + name);
	const timeout = setInterval(() => {
		if (indicator.stopped) {
			log('');
			indicator.start();
		}
	}, 100);

	const proc = Bun.spawn(
		[resolveBin('@wordpress/scripts', { executable: 'wp-scripts' }), 'start', '--hot', `--webpack-src-dir=blocks/${name}`, `--output-path=${getThemeDestination()}/blocks/${name}`],
		{ stdout: verbose ? 'inherit' : 'ignore', stderr: verbose ? 'inherit' : 'ignore', cwd: process.cwd(), onExit: () => { 
			proc.kill();
			warn('Cleaned up processes');
			buildAllBlocks().then(() => {
				process.exit(0);
			});
		 }}
	);

	return proc.exited;
}

function watchAllBlocks(verbose?: boolean) {
	const proc = Bun.spawn(
		[resolveBin('@wordpress/scripts', { executable: 'wp-scripts' }), 'start', '--hot', `--webpack-src-dir=blocks`, `--output-path=${getThemeDestination()}/blocks/`],
		{ stdout: verbose ? 'inherit' : 'ignore', stderr: verbose ? 'inherit' : 'ignore', cwd: process.cwd() }
	);
	process.on('SIGINT', (code) => {
		proc.kill();
		proc.kill();
		warn('Cleaned up processes');
		buildAllBlocks().then(() => {
			process.exit(0);
		});
	});
	return proc.exited;
}

function buildAllBlocks(verbose?: boolean) {
	const command = [resolveBin('@wordpress/scripts', { executable: 'wp-scripts' }), 'build', `--webpack-src-dir=blocks`, `--output-path=${getThemeDestination()}/blocks/`];

	const proc = Bun.spawn(
		command,
		{ stdout: verbose ? 'inherit' : 'ignore', stderr: verbose ? 'inherit' : 'ignore', cwd: process.cwd() }
	);

	return proc.exited;
}

/**
 * Builds the blocks for the project and installs them into the theme, updating
 * the functions.php file as well
 */
export async function buildBlocks({ singleBlock, hot, verbose }: { singleBlock?: string, hot?: boolean, verbose?: boolean } = {}) {
	// Ensure blocks directory exists
	mkdirsSync(`${getThemeDestination()}/blocks/`);

	if (hot) {
		log(chalk.bold('Block Hotloading Enabled -- make sure you have added:'));
		log(chalk.bold("  define('SCRIPT_DEBUG', true);"));
		log(chalk.bold('to your wordpress config, or your blocks will not load at all.'));
	}

	try {
		if (hot) {
			await buildAllBlocks(verbose);
			if (singleBlock) {
				await watchBlock(singleBlock, verbose);
			} else {
				await watchAllBlocks(verbose);
			}
		} else {
			await buildAllBlocks(verbose);
		}
	} catch (err) {
		error(chalk.bold('Failed to build: ', err));
	}

	await buildFunctionsPhp();
	log(chalk.bold('Blocks successfully built.'));
}

export function getThemeBlocks() {
	getTheme();
	
	const blocks = readdirSync('./blocks', { withFileTypes: true })
		.filter((block) => block.isDirectory());

	const blockIds = blocks.map((block) => readFileSync(`./blocks/${block.name}/block.json`))
		.map((block) => JSON.parse(block.toString('utf-8')).name);

		return blockIds;
}

export function getThemeBlockPaths() {
	getTheme();
	
	const blocks = readdirSync('./blocks', { withFileTypes: true })
		.filter((block) => block.isDirectory());

	return blocks.map((v) => v.name);
}