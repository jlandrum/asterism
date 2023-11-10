<center><img src="./logo.png" height="196" width="196" /></center>

## ⁂ Asterism: The Rapid Development Wordpress Toolkit

Asterism is a command-line tool designed for rapid development of block-based themes in WordPress. It provides a simple and efficient approach to creating visually appealing and functional themes. With Asterism, developers can leverage pre-configured templates and streamline tasks through a command-line interface. This enables quick prototyping, iteration, and deployment of WordPress themes, making it accessible to both beginners and experienced developers alike.

To install it globally, run `bun install -g @yesand/asterism` - [bun](https://bun.sh) is required. Bun 1.0.10 or higher is strongly recommended. 

Asterism can then be used in your Wordpress development folder using `asterism`, `ast` or `wpa`

The reason bun was chosen is because it's extremely fast and because it allows Asterism to be built as a first-class TypeScript project; Everything will have proper documentation to make creating blocks an absolute breeze.

## What asterism is:
Asterism intends to replace the workflow of creating build scripts and tools within a 
wordpress theme which often gets deployed with the theme, while adding a series of powerful
utilities for adding functionality to wordpress quickly and in a modular manner. The goal
is a mix of portability and reusability. 

Asterism projects mirror Wordpress themes, and the generated themes do not include any code
that requires Asterism to work - even if you use Asterism's utility components, these are
designed to function as their own thing, identical to if you wish to use a React UI library
within a Wordpress theme. They should be able to be zipped and installed on a target site
without needing any tools from Asterism.

## What asterism isn't:
Asterism does not replace the theme development workflow nor does it intend to replace or
modify Wordpress development practices. Asterism-generated blocks are standard Wordpress
blocks that do not have any asterism-specific functionality included by default. 
Additionally, the tooling intends to be Gutenberg-compliant, not Wordpress-compliant -
that is, it intends to work anywhere Gutenberg works (with plans to support non-wordpress)
usage in the (distant) future.

You will still need to follow Wordpress best practices regardless, and understand how 
Gutenberg blocks work in the context of Wordpress.

## Usage:
```
Usage: asterism [options] [command]

Options:
  -i, --interactive       interactive mode
  -h, --help              display help for command

Commands:
  build [options]         Builds the current theme and copies it to the WordPress themes folder
  watch [options]         Watches the current theme for changes and rebuilds it
  init [options]          Initializes a new theme
  create-block [options]  Creates a new block
  list-blocks [options]   Lists all blocks in the current theme
  help [command]          display help for command
```

## Documentation
You may view additional details in the documentation [here](docs/DOCS.md).

## Folders

### blocks
Blocks go here. To create a block, run `asterism create-block`.

### theme
Classic Wordpress theme assets go here. functions.php is special in that Asterism will
append additional content to the end of your functions.php; other files will simply be copied.

### css
Styles must be added into the `styles` section of `theme.json` to load. 

To load a style:
* Add `{ "name": "<scss or css file name from css>" }`

To load an editor style:
* Add `{ "name": "<scss or css file name from css>", "editorStyle": true }`

These styles will be loaded into `functions.php` for themes and `blocks.php` for block-only projects.

### js
Basic support has been added - any .js file added to the /js folder will be loaded globally.
It is only currently recommended to use this if you are absolutely sure you wish for a script
to run globally; a better process identical to CSS will be added soon.

## Initializing a project
To initialize an Asterism project, first create a directory to store
the files for your project (We recommend `/src` in the root of your WordPress install) then `cd` into that directory.

From there, simply run `asterism init`, follow the prompts, and the bare necessities will be put into place! If you are adding blocks to an existing theme, you will need to set `advanced.mode` to `blockOnly` in your `theme.json` file. For more information, see [Block-Only Mode](#block-only-mode) under Advanced Usage.


## Creating a block

Creating a block is as simple as using `asterism create-block -i`.

You will be taken through the process step by step. It's higly recommended to make use of the fact that by default, the stylesheet is a globally-l

## Making Blocks

Blocks in Asterism and Gutenberg are simply React blocks. There is a catch however - when Gutenberg saves, it expects two things:
* The component is pure
* The component makes no hook calls

This is addressed through the use of RenderScope. To use, simply import `<EditOnly>` and/or `<SaveOnly>` from `@yesand/asterism/components/RenderScope`. As the names imply, anything within `EditOnly` will only appear within the Gutenberg editor, and anything within `SaveOnly` will only appear on the frontend. If you need to use hooks, create a nested component and insert it into your block within an `EditOnly`.

The other available components make use of this, so they generally can be used without needing to directly use `EditOnly` or `SaveOnly`

## Components

Asterism includes a few useful components that make creating inline-editable blocks easier.

### ImageInput
Allow the user to select an image

### InnerBlocks
Mirrors the Gutenberg InnerBlocks, but uses SaveOnly/EditOnly to properly display/save the added items.

<small>Note: A limitation within Gutenberg itself - only one of these can be used per component. If you wish to use similar functionality but in multiple regions, see NestedComponents</small>

### LiveTextInput
A textbox that attempts to properly resize and mirror the expected output CSS to make the overall look and feel mirror what should appear on the clientside.

### NestedComponents
A simplified version of InnerBlocks that stores data as a JSON object. Unlike InnerBlocks, multiple can be used - however these components cannot contain additional blocks. 

## Advanced Usage
### Block-Only Mode
If `mode` is set to `blockOnly` under `advanced` in your `theme.json`, various things will happen:

* Files will no longer be copied from the theme folder
* functions.php will no longer be updated; instead, a blocks.php file will be created, and can be imported
  into your theme's functions.php manually.
* CSS will no longer be compiled

Note that in order for Asterism to place into the proper location, the `namespace` must still be set to the
folder name of your theme or `themeFolder` must be set in your `theme.json`.

<small>In the future, more modes may be provided to allow advanced usage of Asterism.</small>

## What's Missing / Broken / Might Change
* Site-wide JavaScript is not yet built or copied over.
* ~~The styles are automatically minified and injected into your theme's theme.css - this may change to allow creating multiple css files with automatic insertion~~ Styles no longer end up in theme.css as this reduced compatibility with many plugins. See the [css](#css) section for details.
* Currently, this depends on the webpack configuration provided by @wordpress/scripts. This is fine - but it depends on a lot of tools with outdated dependencies which may break things when `bun install -g` is used to add additional tools.
* Some users have reported global packages not being properly linked in bun. This may also occur if you are not using a known shell. Be sure to add `./bun/bin` to your path if the command does not work after install.
* The RenderScope utility uses a kludgy hack to detect if it's in save or edit mode. The Gutenberg team is looking to add hook support to the save method - at which point this utility may be deprecated.
* Bun 1.0.10 introduced a fix to `spawn` which fixed an issue that could cause the `webpack` and `node` processes spawned during the build process to become disconnected and continue running after Asterism finishes a build or a watch session is ended. It is highly recommended that you use bun 1.0.10 or higher or you may need to run `killall node` and `killall webpack` as the build process will otherwise fail.
* Wordpress' dev tools invoke `node` directly by seeking the binary. This bypasses bun's ability to run `node` invocations through `bun` instead. There are notable speed increases when using `bun` and issues have not been experienced, but we've yet to find a workaround to force `bun` usage in the scripts, so `node` must also be installed for `webpack` to work.

## Planned Features
* Support for React Islands - components that will allow React hooks to be used on the front-end. This is in progress but not recommended for use as it has significant limitations.
* ~~Automatic script registration.~~ basic support for this has been added.

<small>Brought to you by the team at [Yes& Agency](https://yesandagency.com)</small>