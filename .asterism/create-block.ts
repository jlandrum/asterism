import pkg from '../package.json';
import theme from '../theme.json';

import minimist from 'minimist';
import chalk from 'chalk';

const { log, error } = console;
const args = minimist(process.argv.slice(2), {
  string: ['n', 'name'],
  alias: {
    'name': 'n',
    'dynamic': 'd',
    'description': 'D',
  }
});

log(chalk.bold.cyanBright(`Asterism ${pkg.version}`));
log(chalk.cyanBright(`Create Block Utility`));

function help(code: number = -1) {
  log(chalk.bold.whiteBright(`\nOptions:`));
  log(chalk.whiteBright(`--name <name>, -n <name>: Specifies the name of the block`));
  log(chalk.whiteBright(`--dynamic, -d: Creates a dynamic block`));
  log(chalk.whiteBright(`--description <description>, -D: Provides a short description`));
  log(chalk.whiteBright(`<slug>: Provides the block slug`));
  process.exit(code);
}

if (Object.keys(args).length <= 1 || args._.length !== 1) {
  help(0);
}

if (!theme.namespace) {
  error(chalk.redBright('Theme configuration appears to be invalid.'));
  help(3);
}

if (!args.name) {
  error(chalk.redBright('A name must be provided.'));
  help(2);
}

const command = ['bunx', '@wordpress/create-block@latest', '--no-plugin'];

command.push(...['--title', args.name as string]);
command.push(...['--variant', args.dynamic ? 'dynamic' : 'static']);
command.push(...['--namespace', theme.namespace]);
command.push(args._[0]);

Bun.spawn(command, {
  cwd: './blocks',
});
