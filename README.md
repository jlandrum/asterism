# Asterism
The Rapid Development Wordpress Toolkit

## Folders

### blocks
Blocks go here. To create a block, run `bun run create-block`

### theme
Classic Wordpress theme assets go here. functions.php is special in that Asterism will
append additional content to the end of your functions.php
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
