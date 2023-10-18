#! /usr/bin/env bun

import chalk from 'chalk';
import pkg from './package.json';

import { Option, program } from 'commander';

import { build, watch } from './src/build';
import { initTheme } from './src/init';
import { createBlock } from './src/create-block';
import { getThemeBlocks } from './src/blocks';

const { log, error } = console;

log(chalk.bold.blue(`Asterism ${pkg.version}`));

program
  .name('asterism');

program.command('build')
				.description('Builds the current theme and copies it to the WordPress themes folder')
				.action(async () => {
					await build();
				});

program.command('watch')
				.description('Watches the current theme for changes and rebuilds it')
				.argument('[block]', 'The block to watch for changes. If omitted, blocks will not update. This is required if the theme is set to block-only mode.')
				.action(async (block) => {
					await watch(block);
				});

program.command('init')
			 .description('Initializes a new theme')
 			 .action(async () => {
				await initTheme();
			 });

program.command('create-block')
			 .description('Creates a new block')
			 .argument('<title>', 'The title of the block')
			 .argument('<slug>', 'The slug of the block')
	     .option('--type [type]', 'Creates a block of the given type. Valid types are "static", "react-component" and "dynamic".', 'react-component')
			 .option('-d, --description [description]', 'A short description of the block')
			 .option('-i, --icon [icon]', 'The name of a dashicon to use as the block icon')
			 .option('-c, --category [category]', 'The category to place the block in')
			 .action(async (name, slug, options) => {
					createBlock(name, slug, options)
			 });

program.command('list-blocks')
			 .description('Lists all blocks in the current theme')
			 .action(async () => {
					log(getThemeBlocks());
			 });
			 
program.parse();

const options = program.opts();
const limit = options.first ? 1 : undefined;
