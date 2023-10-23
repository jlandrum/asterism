import ImageInput from 'components/ImageInput';
import LiveTextInput from 'components/LiveTextInput';

export * as NestedComponents from './components/NestedComponents';
export * as LiveTextInput from './components/LiveTextInput';
export * as ImageInput from './components/ImageInput';
export { SaveOnly, EditOnly } from './components/SwiftState';

export * from './components/SwiftState';

interface ThemeData {
	"$asterism": true;
	name: string;
	author?: string;
	copyright: string;
	namespace: string;
	description?: string;
	version?: string;
	textDomain: string;
	/** Overrides the output folder name of the theme */
	themeFolder?: string;
	"style.css": {
		uri?: string;
		authorUri?: string;
		license?: string;
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
	exclude: string[];
}

interface Theme extends ThemeData {
	isBlockOnly?: boolean;
}