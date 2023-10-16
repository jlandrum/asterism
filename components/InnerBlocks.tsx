import React from '@wordpress/components';
import { useSwiftState } from "./SwiftState";
import {
  InnerBlocks as InnerBlocksIntl,
  InnerBlocksProps,
} from "@wordpress/block-editor";

export const InnerBlocks = (props: InnerBlocksProps) => {
	const save = useSwiftState();
	return save
		? (<InnerBlocksIntl.Content />)
		: (<InnerBlocksIntl {...props} />)
}