import React from '@wordpress/components';
import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
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