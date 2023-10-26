#! /usr/bin/env bun

import chalk from 'chalk';
import pkg from './package.json';

import { InteractiveCommand, InteractiveOption } from 'interactive-commander';

import { build, watch } from './src/build';
import { initTheme } from './src/init';
import { createBlock } from './src/create-block';
import { getThemeBlockPaths, getThemeBlocks } from './src/blocks';

const { log, error } = console;

log(chalk.bold.blue(`Asterism ${pkg.version}`));

const program = new InteractiveCommand();

const blockPaths = (() => {
	try {
		return getThemeBlockPaths() as readonly string[];
	} catch {
		return [] as const;
	}
})();

program
	.name('asterism');

program.command('build')
	.description('Builds the current theme and copies it to the WordPress themes folder')
	.option('-v, --verbose', 'Enables verbose output', false)
	.action(async (opts) => {
		await build(opts.verbose);
	});

program.command('watch')
	.description('Watches the current theme for changes and rebuilds it')
	.addOption(new InteractiveOption(
		'-b, --block [block]',
		'Watches a specific block, useful for live editing a block.',
	).choices(blockPaths))
	.addOption(new InteractiveOption(
		'-v, --verbose', 'Enables verbose output').default(false))
	.action(async (opts) => {
		await watch(opts.block, opts.verbose);
	});

program.command('init')
	.description('Initializes a new theme')
	.action(async () => {
		await initTheme();
	});

program.command('create-block')
	.description('Creates a new block')
	.addOption(new InteractiveOption(
		'-t, --title [title]', 'Specify the name for this block'
	).argParser((value) => {
		if (!/[A-Za-z0-9 ]+/.test(value)) {
			throw new Error('The block title must only contain letters, numbers and spaces');
		}
		return value;
	}))
	.addOption(new InteractiveOption(
		'-s, --slug [slug]', 'Specify the slug for this block'
	).argParser((value) => {
		if (!/[a-z\-]+/.test(value)) {
			throw new Error('The block slug must only contain lowercase letters and dashes');
		}
		return value;
	}))
	.addOption(new InteractiveOption(
		'--type [type]', 'Creates a block of the given type. Valid types are "static", "react-component" and "dynamic".'
	).default('react-component'))
	.addOption(new InteractiveOption('-d, --description [description]', 'A short description of the block'))
	.addOption(new InteractiveOption('-i, --icon [icon]', 'The name of a dashicon to use as the block icon').choices(require('./src/dashicons.json')))
	.addOption(new InteractiveOption('-c, --category [category]', 'The category to place the block in').choices(require('./src/categories.json')))
	.action(async (options) => {
		createBlock(options)
	});

program.command('list-blocks')
	.description('Lists all blocks in the current theme')
	.action(async () => {
		log(getThemeBlocks().join('\n'));
	});

await program
	.interactive("-i, --interactive", "interactive mode")
	.parseAsync();

const options = program.opts();
const limit = options.first ? 1 : undefined;
