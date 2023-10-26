import { copySync, readdirSync } from "fs-extra";
import path from 'node:path';
import { getThemeDestination } from "./asterism";
import chalk from "chalk";

const { log, error } = console;

/**
 * Copies theme files, as well as handles special cases.
 */
export async function copyJsFiles() {
	try {
		const files = readdirSync('./js');

		files.forEach((file) => {
			const sourcePath = path.resolve(`./js/${file}`);
			const destinationPath = `${getThemeDestination()}/js/${file}`;
			copySync(sourcePath, destinationPath);
			log(chalk.gray(`Copied file: ${file}`));
		});

		log(chalk.bold('Javascript files successfully copied.'));
	} catch (err) {
		console.error(err);
	}
}


export function buildJsPhp(): string {
	var jsPhp = "\nadd_action('wp_enqueue_scripts', function() {";

	try {
		const files = readdirSync('./js', { withFileTypes: true })
			.filter(file => !file.isDirectory())
			.map(folder => folder.name);

		files.forEach((file) => {
			jsPhp += `\n  wp_enqueue_script('${file.replace('.js', '')}', get_template_directory_uri() . '/js/${file}', [], '${file.replace('.js', '')}', true);`;
		});

		jsPhp += '\n});';
	} catch (err) {
		error(chalk.bold('Failed to build: ', err));
	}
	return jsPhp;
}
