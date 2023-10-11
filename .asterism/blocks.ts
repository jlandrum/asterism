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
export async function buildBlocks(hot: boolean) {
  if (hot) {
    log(chalk.bold('Block Hotloading Enabled -- make sure you have added:'));
    log(chalk.bold("  define('SCRIPT_DEBUG', true);"));
    log(chalk.bold('to your wordpress config, or your blocks will not load at all.'));
  }

  try {
    await Bun.spawn(
      ['bunx', 'wp-scripts', hot ? 'start' : 'build', `--webpack-src-dir=./blocks/`, `--output-path=${getThemeDestination()}/blocks/`, hot ? '--hot' : ''],
    ).exited;
  } catch (err) {
    error(chalk.bold('Failed to build: ', err));
  }

  await buildFunctionsPhp();
  log(chalk.bold('Blocks successfully build!'));
}