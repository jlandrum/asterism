import minimist from 'minimist';
import chalk from 'chalk';
import animate from 'chalk-animation';

import path from 'path';
import { watch as fsWatch, mkdirsSync } from 'fs-extra';
import { buildBlocks, getThemeBlockPaths } from './blocks';
import { buildFunctionsPhp, buildPlugin, copyThemeFiles } from './files';
import { writeThemeStyles, writeThemeStylesheet } from './styles';
import { clearThemeCache, getTheme, getThemeDestination } from './asterism';
import { copyJsFiles } from './scripts';

const { log, error } = console;

export async function build(verbose: boolean = false) {
	log(chalk.bold('Starting full build...'));
	const theme = getTheme();

	if (theme.isBlockOnly) {
		log(chalk.yellow('Running in block only mode.'));
	}

	mkdirsSync(getThemeDestination());

	try {
		if (!theme.isBlockOnly) {
			await writeThemeStylesheet();
			await writeThemeStyles();
			await copyThemeFiles();
			await copyJsFiles();
		}
		await buildBlocks({ verbose });
		await buildPlugin();
		log(chalk.bold.greenBright(`Theme ${theme.name} build successfully!`));
	} catch (e) {
		error(chalk.bold.redBright(`Theme ${theme.name} failed to build: ${e}`));
	}

	return true;
}

export async function watch(block: string, verbose: boolean = false) {
	const theme = getTheme();

	const blocks = getThemeBlockPaths();

	if (!blocks.includes(block) && block) {
		error(chalk.bold.red(`Block ${block} does not exist.`));
		return;
	}

	if (block) {
		log(chalk.cyanBright(`Watching block ${block}`));
		buildBlocks({ hot: true, singleBlock: block, verbose });
	} else {
		if (theme.isBlockOnly) {
			error(chalk.bold.red('A block must be provided in block only mode, or this will have no effect.'));
			process.exit(1);
		} else {
			log(chalk.cyanBright('Watching for changes'));
		}
	}

	if (theme.isBlockOnly) {
		log(chalk.yellow('Running in block only mode.'));
	}

	const watcher = fsWatch(
		path.resolve(`./`),
		{ recursive: true },
		(event, filename) => {
			if (!filename) return;

			if (filename.includes('/.')) return;

			if (!theme.isBlockOnly) {
				if (filename.startsWith('theme.json')) {
					clearThemeCache();
					buildFunctionsPhp();
					buildPlugin();
				}
				
				if (filename.startsWith('theme/')) {
					copyThemeFiles();
					buildFunctionsPhp();
				}

				if (/(s|sc|sa)ss/g.test(filename)) {
					writeThemeStylesheet();
					writeThemeStyles();
				}

				if (/js/g.test(filename)) {
					copyJsFiles();
				}
			}

			if (filename.startsWith('blocks')) {
				buildFunctionsPhp();
			}
		},
	);
}