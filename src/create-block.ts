import { copySync, existsSync, mkdirs, readdir, readdirSync } from 'fs-extra';
import pkg from '../package.json';
import { getTheme } from './asterism';

const { error } = console;

interface BlockCreateOptions {
	description?: string;
	icon?: string;
	category?: string;
	type: 'dynamic' | 'static';
}

export async function createBlock(title: string, slug: string, options: BlockCreateOptions) {
	const templatePath = `${__dirname}/templates/blocks/${options.type}`;
	const outPath = `./blocks/${slug}/`;

	if (!existsSync(templatePath)) {
		error(`Invalid block type "${options.type}". Valid types are "static" and "dynamic".`);
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
	} as any;

	for (const file of files) {
		const fileText = await Bun.file(`${templatePath}/${file}`).text();
		const updated = Object.keys(replacers).reduce((p,c) => {
			return p.replaceAll(`$$${c}$$`, replacers[c] as string);
		}, fileText);

		Bun.write(Bun.file(`${outPath}/${file}`), updated);		
	}
}