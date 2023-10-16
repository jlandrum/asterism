import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

import Edit from './edit.tsx';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
} );
