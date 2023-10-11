import path from 'path';

import { copySync, readdirSync } from "fs-extra";
import { getThemeDestination, writeThemeFile } from "./asterism";
import chalk from 'chalk';

const { log, error } = console;

/**
 * Copies theme files, as well as handles special cases.
 */
export async function copyThemeFiles() {
  try {
    const files = readdirSync('./theme');

    files.forEach((file) => {
      const sourcePath = path.resolve(`./theme/${file}`);
      const destinationPath = `${getThemeDestination()}/${file}`;

      // We generate functions.php during block build, so this needs to be skipped
      if (file === 'functions.php') return;
      copySync(sourcePath, destinationPath);
      console.log(chalk.gray(`Copied file: ${file}`));
    });

    await buildFunctionsPhp();
    log(chalk.bold('Files successfully copied.'));
  } catch (err) {
    console.error(err);
  }
}

export async function buildFunctionsPhp() {
  var functionsPhp = await Bun.file('./theme/functions.php').text();
  functionsPhp += "\n\nadd_action('init', function() {";
  try {
    const folders = readdirSync('./blocks', { withFileTypes: true })
      .filter(file => file.isDirectory())
      .map(folder => folder.name);

    folders.forEach((folder) => {
      functionsPhp += `\n  register_block_type(__DIR__  . '/blocks/${folder}/block.json');`
    });

    functionsPhp += '\n});';
  } catch (err) {
    error(chalk.bold('Failed to build: ', err));
  }

  writeThemeFile('functions.php', functionsPhp);
}