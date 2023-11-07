import chalk from "chalk";
import { getTheme, getThemeDestination, writeThemeFile } from "./asterism";
import * as scss from 'sass';

const { log } = console;

/**
 * Generates the theme's style.css file header
 */
export async function generateThemeHeader(): Promise<string> {
	const theme = getTheme();

  const themeDetails = {
    'Theme Name': theme.name,
    'Theme URI': theme?.['style.css']?.uri,
    'Author': theme.author,
    'Author URI': theme?.authorUri,
    'Description': theme.description,
    'Version': theme.version,
    'License': theme?.['style.css']?.license,
    'License URI': theme?.['style.css']?.licenseUri,
    'Text Domain': theme.textDomain || theme.namespace,
  } as { [key: string]: string }

  Object.keys(themeDetails).forEach(key => {
    if (!themeDetails[key]) {
      delete themeDetails[key];
    }
  })

  return `
/*
${Object.keys(themeDetails).map(key => `${key}: ${themeDetails[key]}`).join('\n')}
*/
`.trim();
}

/**
 * Generates the theme's CSS as a string
 * @returns 
 */
export async function buildCss(file: string): Promise<string> {
	console.error(file);
  const styles = scss.compile(`${file}`, { style: "compressed" });
  return styles.css;
}

/**
 * Writes the theme's stylesheet
 */
export async function writeThemeStylesheet() {
  const header = await generateThemeHeader();
	
  log(chalk.bold('theme.css successfully built.'));
	await writeThemeFile('style.css', `${header}`);
}

/**
 * Generates theme styles
 */
export async function writeThemeStyles() {
	const theme = getTheme();

	if (theme.styles) {
		for (const style of theme.styles) {
			const themeFile = `css/${style.name}`;

			if (!await Bun.file(themeFile).exists()) {
				throw new Error(`Source file css/${style.name} does not exist.`);
			}

			const styles = style.name.endsWith('.scss') ? await buildCss(themeFile) : await Bun.file(themeFile).text();
			const outputName = style.name.replace('.scss', '.css');

			await writeThemeFile(`css/${outputName}`, styles);
		}
		log(chalk.bold('Stylesheets successfully built.'));
	}
}

/**
 * Converts a given list of styles to proper PHP for the theme's functions.php file
 * TODO: Simplify this
 * @param styles A list of styles to convert
 * @returns The PHP code to load the styles
 */
export function loadStylesPhp(styles: Style[]) {
	let out = '';
	
	const headerStyles = styles.filter((style) => style.footer !== true)
		.reduce((acc, style) => { acc[style.priority] = [...(acc[style.priority] || []), style]; return acc; }, {} as { [a: string]: Style[] });
	const footerStyles = styles.filter((style) => style.footer === true)
		.reduce((acc, style) => { acc[style.priority] = [...(acc[style.priority] || []), style]; return acc; }, {} as {[a:string]: Style[]});

	const styleMap = {
		frontend: {
			header: {},
			footer: {},
		},
		editor: {
			header: {},
			footer: {},
		},
	} as any;

	styles.forEach((style) => {
		const target = style.editorStyle ? 'editor' : 'frontend';
		const section = style.footer ? 'footer' : 'header';
		const priority = style.priority || '10';
		styleMap[target][section][priority] = styleMap[target][section][priority] || [];
		styleMap[target][section][priority].push(style);
	});

	Object.keys(styleMap).forEach((target) => {
		Object.keys(styleMap[target]).forEach((section) => {
			Object.keys(styleMap[target][section]).forEach((priority) => {
				const action = target === 'frontend' ? 'wp_enqueue_scripts' : 'enqueue_block_assets';
				out += `add_action('${action}', function() {\n` +
					styleMap[target][section][priority].map((style: any) => `  wp_enqueue_style('${style.name.replace('.scss', '.css')}', get_template_directory_uri() . '/css/${style.name.replace('.scss', '.css')}', [], '${style.version || '1.0.0'}');`).join('\n') +
				`\n}, ${priority});\n`
			});
		});
	});

	return out;
}