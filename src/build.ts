import minimist from 'minimist';
import chalk from 'chalk';

import path from 'path';
import { watch as fsWatch, mkdirsSync } from 'fs-extra';
import { buildBlocks } from './blocks';
import { buildFunctionsPhp, copyThemeFiles } from './files';
import { writeThemeStylesheet } from './styles';
import { getTheme, getThemeDestination } from './asterism';

const { log, error } = console;

export async function build() {
	log(chalk.bold('Starting full build...'));
	const theme = getTheme();

	if (theme.isBlockOnly) {
		log(chalk.yellow('Running in block only mode.'));
	}

	mkdirsSync(getThemeDestination());

	try {
		if (!theme.isBlockOnly) {
			await writeThemeStylesheet();
			await copyThemeFiles();
		}
		await buildBlocks();
		log(chalk.bold.greenBright(`Theme ${theme.name} build successfully!`));
	} catch (e) {
		error(chalk.bold.redBright(`Theme ${theme.name} failed to build: ${e}`));
	}

	return true;
}

export async function watch(block: string) {
	const theme = getTheme();
	if (block) {
		log(chalk.cyanBright(`Watching block ${block}`));
		buildBlocks({ hot: true, singleBlock: block });
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

			if (!theme.isBlockOnly) {
				console.error(filename);
				if (filename.startsWith('theme')) {
					copyThemeFiles();
				}

				if (/(s|sc|sa)ss/g.test(filename)) {
					writeThemeStylesheet();
				}
			}

			if (filename.startsWith('blocks')) {
				buildFunctionsPhp();
			}
		},
	);
}