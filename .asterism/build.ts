import pkg from '../package.json';
import _theme from '../theme.json';
import minimist from 'minimist';
import chalk from 'chalk';

import path from 'path';
import { watch } from 'fs-extra';
import { buildBlocks } from './blocks';
import { buildFunctionsPhp, copyThemeFiles } from './files';
import { writeThemeStylesheet } from './styles';
import { getTheme } from './asterism';

const { log, error } = console;
const theme = getTheme();

const args = minimist(process.argv.slice(2), {
	alias: {
		"w": "watch"
	},
	string: ['watch'],
});

async function build() {
	log(chalk.bold('Starting full build...'));
	if (theme.isBlockOnly) {
		log(chalk.bgYellow('Running in Block-Only mode.'));
	}

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

log(chalk.bold.cyanBright(`Asterism ${pkg.version}`));

if (args?.watch?.length === 0) {
	error(chalk.redBright(`When using watch mode, a single block slug must be provided due to known issues with HMR.`));
	process.exit(0);
}

if (args.watch) {
	log(chalk.cyanBright(`Watching block ${args.watch}`));
	log(chalk.cyanBright('Watching for changes'));

	buildBlocks({ hot: true, singleBlock: args.watch });

	if (theme.isBlockOnly) {
		log(chalk.bgYellow('Running in Block-Only mode.'));
	}

	const watcher = watch(
		path.resolve(`${import.meta.dir}/..`),
		{ recursive: true },
		(event, filename) => {
			if (!filename) return;

			if (!theme.isBlockOnly) {

				// Don't process asterism files
				if (filename.startsWith('.asterism')) {
					return;
				}

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

} else {
	build();
}