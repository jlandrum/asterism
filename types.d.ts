/// <reference lib="dom" />

export * from './components/ImageInput/ImageInput';
export * from './components/InnerBlocks/InnerBlocks';
export * from './components/ImageInput/ImageInput';
export * from './components/LiveTextInput/LiveTextInput';
export * from './components/NestedComponents/NestedComponents';
export * from './components/SwiftState/SwiftState';

interface PostTypeField {
	name: string;
	title: string;
	type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'image' | 'gallery' | 'file' | 'wysiwyg';
	readOnly?: boolean;
}

interface Style {
	/** The name of the style's file */
	name: string;
	/** The load priority of the style */
	priority: number;
	/** The version for this style */
	version?: string;
	/** Indicates the style should load in the footer */
	footer?: boolean;
	/** Indicates if the style is for the editor */
	editorStyle?: boolean;
}

interface PostType {
	/** The name of the post type */
	name: string;
	/** Labels to display. Note that these will be made L18N ready using your theme's
	 *  text domain.
	 */
	labels ?: {
		/** The plural name of this post type */
		name?: string;
		/** The singular name of this post type */
		singularName?: string;
		/** The menu name for this post type */
		menuName?: string;
	},
	/** If the post type should be publicly accessible */
	public ?: boolean;
	/** Allows this post type to have archived items */
	hasArchive ?: boolean;
	/** Should the post type be available in rest APIs? */
	showInRest ?: boolean;
	/** Use the Gutenberg editor (defaults to false) */
	gutenbergEnabled?: boolean;
	/** Indicates the supported features of the post type */
	supports: string[];
	/** Sets a custom title for the fields box */
	fieldsTitle?: string;
	/** Adds fields and corresponding meta boxes */
	fields?: PostTypeField[];
};

interface ThemeData {
	"$schema": string;
	/** This must be set to ensure distinction from a Wordpress theme.json
	 *  As theme.json is necessary for WordPress Gutenberg build tools,
	 *  it must use theme.json so that these tools don't inadvertently 
	 *  use the theme's actual theme.json file if one is provided.
	 */
	"$asterism": true;
	/** The name of the theme */
	name: string;
	/** The author(s) of the theme */
	author?: string;
	/** The URI for the creator's website (Where more information about
	 *  the theme may be made available) */
	authorUri?: string;
	/** The copyright for the theme */
	copyright: string;
	/** The namespace of the theme. This also doubles as the theme's
	 *  folder name if themeFolder is not provided.
	 */
	namespace: string;
	/** A description of this theme's purpose */
	description?: string;
	/** The version of the theme */
	version?: string;
	/** The text domain for this theme */
	textDomain: string;
	/** Overrides the output folder name of the theme */
	themeFolder?: string;
	/** Specific fields for the style.css header */
	"style.css": {
		/** The URI of the theme (Where it's available) */
		uri?: string;
		/** The license for the theme */
		license?: string;
		/** The URI to the license text document */
		licenseUri?: string;
	};
	advanced?: {
		/** Sets the mode.
		 * blockOnly: Enables block-only mode - which turns Asterism into a block building toolset. */
		mode?: 'blockOnly';
		/** Attempts to prevent the gutenberg styles from loading on the client.
		 * Note that this may break external plugins and some WordPress plugins that
		 * depend on the gutenberg styles. USE WITH CAUTION!
		 */
		noGutenbergFrontend?: boolean;
	};
	/** Controls the allowed/excluded core blocks. If allow, only the blocks in the list
	 * will be available. If exclude, all blocks but those specified will be available.
	 * Blocks within the theme are not included. Both should not be set.
	 */
	allow: string[];
	/** Controls the allowed/excluded core blocks. If allow, only the blocks in the list
	 * will be available. If exclude, all blocks but those specified will be available.
	 * Blocks within the theme are not included. Both should not be set.
	 */	
	exclude: string[];
	/** Names of built-in Wordpress styles to remove. Use with caution, as some are
	 *  needed for the editor to function properly.
	 */
	noStyle?: string[];
	/** Post types to include with the theme */
	postTypes?: PostType[]
	/** Specifies styles as individual stylesheets */
	styles?: Style[];
}

interface Theme extends ThemeData {
	isBlockOnly?: boolean;
}