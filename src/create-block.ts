import { copySync, existsSync, mkdirs, readdir, readdirSync } from 'fs-extra';
import pkg from '../package.json';
import { getTheme } from './asterism';
import chalk from 'chalk';

const { log, error } = console;

interface BlockCreateOptions {
	title: string,
	slug: string,
	description?: string;
	icon?: string;
	category?: string;
	template: string;
}

function replaceTokens(tokens: any, text: string) {
	return Object.keys(tokens).reduce((p,c) => {
		return p.replaceAll(`$$${c}$$`, tokens[c] as string);
	}, text);
}

export async function createBlock({title, slug, ...options}: BlockCreateOptions) {
	const templatePath = `${__dirname}/templates/blocks/${options.template}`;
	const outPath = `./blocks/${slug}/`;

	if (!existsSync(templatePath)) {
		error(`Invalid block template "${options.template}".`);
		return;
	}

	if (existsSync(outPath)) {
		error(`The block "${title}" appears to already exist.`);
		return;
	}

	const theme = getTheme();
	const files = await readdir(templatePath);

	await mkdirs(`./blocks/${slug}`);

	const replacers = {
		namespace: theme.namespace,
		description: options.description || `A block for the ${theme.name} theme.`,
		slug: slug,
		icon: options.icon || 'smiley',
		category: options.category || 'widgets',
		textdomain: theme.textDomain,
		title,
		component: title.replace(/[\s_-]/g, ''),
	} as any;

	for (const file of files) {
		const fileText = await Bun.file(`${templatePath}/${file}`).text();
		const updated = replaceTokens(replacers, fileText);

		const replacedFile = replaceTokens(replacers, file);
		Bun.write(Bun.file(`${outPath}/${replacedFile}`), updated);
	}

	log(chalk.greenBright(`Created block ${title} with slug ${slug} at ${outPath} for theme ${theme.name}`));
}