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
  const styles = scss.compile(`css/${file}`, { style: "compressed" });
  return styles.css;
}

/**
 * Generates the theme's style editor CSS as a string
 * @returns 
 */
export async function buildEditorCss(): Promise<string|undefined> {
	const themeFile = Bun.file('./css/style-editor.scss');
	if (!(await themeFile.exists())) {
		return undefined;
	}
  const styles = scss.compile('./css/style-editor.scss', { style: "compressed" });
  return styles.css;
}

/**
 * Writes the theme's stylesheet
 */
export async function writeThemeStylesheet() {
  const header = await generateThemeHeader();
	const theme = getTheme();
	let baseStyles = '';

	// If the user has specified theme.scss, don't include it into the theme stylesheet.
	if (!theme.styles?.find((style) => style.name === 'theme.scss')) {
		baseStyles = await buildCss('./css/theme.scss');
	}

	const editorStyles = await buildEditorCss();

  log(chalk.bold('theme.css successfully built.'));
	if (editorStyles) {	
		await writeThemeFile('style-editor.css', editorStyles);
	}
	await writeThemeFile('style.css', baseStyles ? `${header}\n\n${baseStyles}` : `${header}`);
}

/**
 * Generates theme styles
 */
export async function writeThemeStyles() {
	const theme = getTheme();

	if (theme.styles) {
		for (const style of theme.styles) {
			if (!await Bun.file(`css/${style.name}`).exists()) {
				throw new Error(`Source file css/${style.name} does not exist.`);
			}

			const styles = style.name.endsWith('.scss') ? await buildCss(style.name) : await Bun.file(style.name).text();
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
	
	out += Object.keys(headerStyles).map((priority) => {
		const styles = headerStyles[priority];
		return `add_action('wp_enqueue_scripts', function() {\n` +
			styles.map((style) => `  wp_enqueue_style('${style.name.replace('.scss', '.css')}', get_template_directory_uri() . '/css/${style.name.replace('.scss', '.css')}', [], '${style.version || '1.0.0'}');`).join('\n') +
			`\n}, ${priority});\n`
	}).join('\n');	
	
	out += Object.keys(footerStyles).map((priority) => {
		const styles = footerStyles[priority];
		return `\nadd_action('get_footer', function() {\n` +
			styles.map((style) => `  wp_enqueue_style('${style.name.replace('.scss', '.css')}', get_template_directory_uri() . '/css/${style.name.replace('.scss', '.css')}', [], '${style.version || '1.0.0'}');`).join('\n') +
			`\n}, ${priority});\n`
	}).join('\n');

	return out;
}