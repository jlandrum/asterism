interface ThemeData {
	name: string;
	author?: string;
	copyright: string;
	namespace: string;
	description?: string;
	version?: string;
	textDomain: string;
	"style.css": {
		uri?: string;
		authorUri?: string;
		license?: string;
		licenseUri?: string;
	};
	advanced?: {
		/** Enables block-only mode - which turns Asterism into a block building toolset. */
		mode?: 'blockOnly';
	};
}

interface Theme extends ThemeData {
	isBlockOnly?: boolean;
}
