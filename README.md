<center><img src="./logo.png" height="196" width="196" /></center>

## ⁂ Asterism: The Rapid Development Wordpress Toolkit

Asterism is a command-line tool designed for rapid development of block-based themes in WordPress. It provides a simple and efficient approach to creating visually appealing and functional themes. With Asterism, developers can leverage pre-configured templates and streamline tasks through a command-line interface. This enables quick prototyping, iteration, and deployment of WordPress themes, making it accessible to both beginners and experienced developers alike.

To install it globally, run `bun install -g @yesand/asterism` - [bun](https://bun.sh) is required.

Asterism can then be used in your Wordpress development folder using `asterism`, `ast` or `wpa`

The reason bun was chosen is because it's extremely fast and because it allows Asterism to be built as a first-class TypeScript project; Everything will have proper documentation to make creating blocks an absolute breeze.

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

## Folders

### blocks
Blocks go here. To create a block, run `asterism create-block`.

### theme
Classic Wordpress theme assets go here. functions.php is special in that Asterism will
append additional content to the end of your functions.php; other files will simply be copied.

### css
Stylesheets will be built from here and put inside style.css.

### js
TODO: Not yet implemented

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
* The styles are automatically minified and injected into your theme's theme.css - this may change to allow creating multiple css files with automatic insertion
* Currently, this depends on the webpack configuration provided by @wordpress/scripts. This is fine - but it depends on a lot of tools with outdated dependencies which may break things when `bun install -g` is used to add additional tools.
* Some users have reported global packages not being properly linked in bun. This may also occur if you are not using a known shell. Be sure to add `./bun/bin` to your path if the command does not work after install.
* The RenderScope utility uses a kludgy hack to detect if it's in save or edit mode. The Gutenberg team is looking to add hook support to the save method - at which point this utility may be deprecated.

## Planned Features
* Support for React Islands - components that will allow React hooks to be used on the front-end.
* Automatic script registration.

<small>Brought to you by the team at [Yes& Agency](https://yesandagency.com)</small>