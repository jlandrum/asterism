# Asterism
The Rapid Development Wordpress Toolkit

You can install it globally (recommended), or you can install it into your project.

To install it globally, run `bun install -g wpasterism` - bun is required.


## Usage:
```
Asterism 0.0.5
Usage: asterism [options] [command]

Options:
  -h, --help                             display help for command

Commands:
  build                                  Builds the current theme and copies it to the WordPress themes folder
  watch [block]                          Watches the current theme for changes and rebuilds it
  init                                   Initializes a new theme
  create-block [options] <title> <slug>  Creates a new block
  help [command]                         display help for command
```

## Folders

### blocks
Blocks go here. To create a block, run `asterism create-block`

### theme
Classic Wordpress theme assets go here. functions.php is special in that Asterism will
append additional content to the end of your functions.php; other files will simply be copied.

### css
Stylesheets will be built from here and put inside style.css.

### js
TODO: Not yet implemented

## Advanced Usage
## Block-Only Mode
If `mode` is set to `blockOnly` under `advanced` in your `theme.json`, various things will happen:

* Files will no longer be copied from the theme folder
* functions.php will no longer be updated; instead, a blocks.php file will be created, and can be imported
  into your theme's functions.php manually.
* CSS will no longer be compiled

Note that in order for Asterism to place into the proper location, the `namespace` must still be set to the
folder name of your theme, and Asterism's `src` folder must still be at the root of your WordPress install.

In the future, more modes may be provided to allow advanced usage of Asterism.

This project was created using `bun init` in bun v1.0.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
