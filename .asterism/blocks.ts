import chalk from "chalk";

import { readdirSync } from "fs-extra";
import { getThemeDestination, writeThemeFile } from "./asterism";
import path from 'path';
import { buildFunctionsPhp } from "./files";

const { log, error } = console;

/**
 * Builds the blocks for the project and installs them into the theme, updating
 * the functions.php file as well
 */
export async function buildBlocks() {
  try {
    const folders = readdirSync('./blocks', { withFileTypes: true })
      .filter(file => file.isDirectory())
      .map(folder => folder.name);

    folders.forEach((folder) => {
      const blockData = require(path.resolve(`./blocks/${folder}/block.json`));

      log(chalk.gray(`Building block: ${blockData.title} (${blockData.name})`));
      Bun.spawn(['bunx', 'wp-scripts', 'build', `--webpack-src-dir=./blocks/${folder}`, `--output-path=${getThemeDestination()}/blocks/${folder}`]);
    });

  } catch (err) {
    error(chalk.bold('Failed to build: ', err));
  }

  await buildFunctionsPhp();
  log(chalk.bold('Blocks successfully build!'));
}