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

const args = minimist(process.argv.slice(2), {
  alias: {
    "w": "watch"
  }
});

async function build() {
  const theme = getTheme();
  log(chalk.bold('Starting full build...'));
  try {
    await writeThemeStylesheet();    
    await copyThemeFiles();
    await buildBlocks(false);
    log(chalk.bold.greenBright(`Theme ${theme.name} build successfully!`));
  } catch (e) {
    error(chalk.bold.redBright(`Theme ${theme.name} failed to build: ${e}`));
  }

  return true;
}

log(chalk.bold.cyanBright(`Asterism ${pkg.version}`));

if (args.watch) {
  log(chalk.cyanBright('Watching for changes'));  
  buildBlocks(true);
  const watcher = watch(
    path.resolve(`${import.meta.dir}/..`),
    { recursive: true },
    (event, filename) => {
      if (!filename) return;

      // Don't process asterism files
      if (filename.startsWith('.asterism')) {
        return;
      }

      if (filename.startsWith('theme')) {
        copyThemeFiles();
      }
      
      if (filename.startsWith('blocks')) {
        buildFunctionsPhp();
      }      
      
      if (/(s|sc|sa)ss/g.test(filename)) {
        writeThemeStylesheet();
      }
    },
  );
} else {
  build();
}