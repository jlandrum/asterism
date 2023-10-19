import chalk from "chalk";
import { copy, cpSync, existsSync, mkdirs } from "fs-extra"
import * as readline from 'readline';

const { log, error, warn } = console;

export async function initFolders() {
	await mkdirs('./blocks');
	await mkdirs('./theme');
	await mkdirs('./css');
	await mkdirs('./js');
}

export async function initFiles(baseTheme: string = "clean") {
	if (!existsSync(`${__dirname }/templates/theme/${baseTheme}`)) {
		throw new Error(`${baseTheme} does not exist as a theme template.`)
	}

	if (!(await Bun.file('./css/theme.scss').exists())) {
		cpSync(`${__dirname }/templates/theme.scss`, './css/theme.scss');
	}

	copy(`${__dirname }/templates/theme/${baseTheme}`, './theme', { overwrite: false });

	if (!(await Bun.file('./package.json').exists())) {
		cpSync(`${__dirname}/templates/package.json`, './package.json');
	}

	if (!(await Bun.file('./tsconfig.json').exists())) {
		cpSync(`${__dirname}/templates/tsconfig.json`, './tsconfig.json');
	}
}

async function _askForInput(question: string, currentValue?: string, defaultValue: string = ""): Promise<string> {
	return new Promise((resolve, reject) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

/**
 * Asks the user to provide an answer if one hasn't been already provided.
 * @param question The question to ask
 * @param currentValue The current value from the passed in theme data
 * @param defaultValue The default value to presetn to the user
 * @returns 
 */
async function askForInput(question: string, currentValue?: string, defaultValue: string = "", verify?: RegExp): Promise<string> {
	while (true) {
		const response = await _askForInput(chalk.bold(question), currentValue, defaultValue);
		if (response) {
			if (!verify || verify.test(response)) {
				return response.trim();
			} else {
				warn(chalk.yellowBright('Invalid value provided.'));
			}
		} else {
			warn(chalk.yellowBright('You must provide a value.'));
		}
	}
}

export async function createTheme(theme: Partial<ThemeData> = {}) {
	if (existsSync(`./theme.json`)) {
		return;
	}

	const themeOut: Partial<ThemeData> = {...theme};

	themeOut['$asterism'] = true;
	themeOut.name = await askForInput('Theme Name: ', theme.name, 'Asterism Theme');
	themeOut.copyright = await askForInput('Copyright: ', theme.copyright, `©️ ${new Date().getFullYear()}`);
	themeOut.namespace = await askForInput('Namespace: ', theme.namespace, 'asterism-theme', /^[a-z0-9-]+$/);
	themeOut.textDomain = await askForInput('Text Domain: ', theme.namespace, 'asterism-theme', /^[a-z0-9-]+$/);

	Bun.write('./theme.json', JSON.stringify(themeOut, null, 2));
}

export async function initTheme(theme?: Partial<ThemeData>) {
	await createTheme(theme);
	await initFolders();
	await initFiles();
}