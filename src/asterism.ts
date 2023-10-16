import { mkdirsSync, readFileSync } from 'fs-extra';
import path from 'node:path';
import { findFile } from './utils';

let themeObj: Theme | undefined = undefined;
/**
 * Gets the current theme configuration
 * @returns The Theme Data for the current theme
 */
export function getTheme() {
	if (themeObj) return themeObj;
	const themeFile = findFile('theme.json');

	if (themeFile) {
		const _theme = JSON.parse(readFileSync(themeFile).toString('utf-8'));

		themeObj = {
			...(_theme as ThemeData),
			isBlockOnly: (_theme as ThemeData)?.advanced?.mode === 'blockOnly',
		};

		return themeObj;
	}

	throw new Error('A theme.json file must exist in the current directory.');
}

/**
 * Gets the current path for the theme relative to the asterism build tools
 * @returns A string pointing to the path of the WordPress themes folder
 */
export const getThemeDestination = () => path.resolve(`../wp-content/themes/${getTheme().namespace}`);

/**
 * Gets the absolute path for a destination for a file
 * @param file The file path to resolve
 * @returns The destination file path
 */
export const getThemeFileDestination = (file: string) => path.resolve(`../wp-content/themes/${getTheme().namespace}/${file}`);

/**
 * Writes a file to the theme, ensuring the path to the file exists
 * @param file The filename to write, relative to the output theme directory
 * @param data The data to write to the file
 */
export async function writeThemeFile(file: string, data: string) {
  mkdirsSync(path.dirname(file));
  return Bun.write(getThemeFileDestination(file), data);
}