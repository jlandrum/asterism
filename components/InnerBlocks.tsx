import React from '@wordpress/components';
import { useSwiftState } from "./SwiftState";
import {
  InnerBlocks as InnerBlocksIntl,
} from "@wordpress/block-editor";

export const InnerBlocks = (props: InnerBlocksIntl.Props) => {
  const save = useSwiftState();
  return save ? <InnerBlocksIntl.Content /> : <InnerBlocksIntl {...props} />;
};