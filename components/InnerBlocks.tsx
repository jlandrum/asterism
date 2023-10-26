import React from '@wordpress/components';
import { EditOnly, SaveOnly } from "./SwiftState";
import {
  InnerBlocks as InnerBlocksIntl,
} from "@wordpress/block-editor";

export const InnerBlocks = (props: InnerBlocksIntl.Props) => (
	<>
		<SaveOnly>
			<InnerBlocksIntl.Content />
		</SaveOnly>
		<EditOnly>
			<InnerBlocksIntl {...props} />
		</EditOnly>
	</>
);

export default InnerBlocks;