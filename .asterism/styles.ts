import chalk from "chalk";
import { getTheme, getThemeDestination, writeThemeFile } from "./asterism";
import * as scss from 'sass';

const { log } = console;

/**
 * Generates the theme's style.css file header
 */
export function generateThemeHeader(): string {
  const theme = getTheme();

  const themeDetails = {
    'Theme Name': theme.name,
    'Theme URI': theme['style.css'].uri,
    'Author': theme.author,
    'Author URI': theme['style.css'].authorUri,
    'Description': theme.description,
    'Version': theme.version,
    'License': theme['style.css'].license,
    'License URI': theme['style.css'].licenseUri,
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
export async function buildCss(): Promise<string> {
  const styles = scss.compile('./css/theme.scss', { style: "compressed" });
  return styles.css;
}

/**
 * Writes the theme's stylesheet
 */
export async function writeThemeStylesheet() {
  const header = generateThemeHeader();
  const styles = await buildCss();

  log(chalk.bold('Stylesheet successfully built.'));
  await writeThemeFile('style.css', `${header}\n\n${styles}`);
}
