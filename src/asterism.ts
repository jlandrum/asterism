import { mkdirsSync, readFileSync } from 'fs-extra';
import path from 'node:path';
import { findFile } from './utils';
import chalk from 'chalk';

const { log } = console;

let themeObj: Theme | undefined = undefined;
/**
 * Gets the current theme configuration
 * @returns The Theme Data for the current theme
 */
export function getTheme() {
	if (themeObj) return themeObj;
	const themeFile = findFile('theme.json', './', `"$asterism": true`);

	if (themeFile) {
		process.chdir(path.dirname(themeFile));

		const _theme = JSON.parse(readFileSync('theme.json').toString('utf-8'));

		themeObj = {
			...(_theme as ThemeData),
			themeFolder: _theme.themeFolder || _theme.namespace,
			isBlockOnly: (_theme as ThemeData)?.advanced?.mode === 'blockOnly',
		};

		return themeObj;
	}

	throw new Error('An theme.json file must exist somewhere within the current directory.');
}

/**
 * Clears the theme cache so that next time getTheme is called, it will re-read the theme.json file
 */
export function clearThemeCache() {
	themeObj = undefined;
	log(chalk.gray('Cleared theme cache'));
}

/**
 * Gets the current path for the theme relative to the asterism build tools. E
 * @returns A string pointing to the path of the WordPress themes folder
 */
export const getThemeDestination = (subfolder?: string) => {
	const target = path.resolve(`../wp-content/themes/${subfolder ? `${subfolder}/` : ''}${getTheme().themeFolder}`);
	mkdirsSync(target);
	return target;
}

/**
 * Gets the absolute path for a destination for a file in the theme
 * @param file The file path to resolve
 * @returns The destination file path
 */
export const getThemeFileDestination = (file: string) => path.resolve(`../wp-content/themes/${getTheme().themeFolder}/${file}`);

/**
 * Gets the absolute path for a destination for a file in the plugin
 * @param file The file path to resolve
 * @returns The destination file path
 */
export const getPluginFileDestination = (file: string) => path.resolve(`../wp-content/plugins/${getTheme().themeFolder}/${file}`);

/**
 * Writes a file to the theme, ensuring the path to the file exists
 * @param file The filename to write, relative to the output theme directory
 * @param data The data to write to the file
 */
export async function writeThemeFile(file: string, data: string) {
	mkdirsSync(path.dirname(getThemeFileDestination(file)));
  return Bun.write(getThemeFileDestination(file), data);
}

/**
 * Writes a file to the plugin, ensuring the path to the file exists
 * @param file The filename to write, relative to the output plugin directory
 * @param data The data to write to the file
 */
export async function writePluginFile(file: string, data: string) {
	mkdirsSync(path.dirname(getPluginFileDestination(file)));
	return Bun.write(getPluginFileDestination(file), data);
}