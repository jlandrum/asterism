import React, { useRef } from "@wordpress/element";
import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
import { InnerBlocks } from "@wordpress/block-editor";
import { Block, BlockInstance } from '@wordpress/blocks';
import { tool } from "@wordpress/icons";
import './NestedComponents.scss';
import { NestedEditor } from "./NestedEditor";
import { NestedSave } from "./NestedSave";
import { NestedInnerBlockEditor } from "./NestedInnerBlockEditor";


interface ChildProps<T> {
	value: T,
	index: number,
	slot?: string,
	toolbarVisible?: boolean;
	update: (obj: Partial<T>) => void;
	active?: boolean;
}
/**
 * NestedComponentsProps type.
 * @typedef {object} NestedComponentsProps
 * @property {string} value - The object that holds the data for the nested components
 */
export interface NestedComponentsProps<T> {
  /** The nested content */
  value: T[];
  /** When adding a new item, this object will be used to model the new item's defaults */
  emptyObject?: T;
  /** @inheritdoc */
  className?: string;
  /** If provided, gives the slots an explicit name. A slot which matches the name
   *  will exist at the end of the toolbar, and a numbered slot (eg., slotName_#)
   *  for every item */
  slotName?: string;
  /** Renders the controls into a child slot */
  useSlot?: string;
  /** If set, the buttons will reflect a horizontal layout */
  horizontal?: boolean;
  /** Limits the maximum number of items that can be added */
  maxItems?: number;
  /** Overrides the base element to use */
  element?: string;
  /** If true, the individual items will no longer have their own toolbar. Instead,
   *  only one item will be displayed and any toolbar items hoisted into the nested
   *  toolbar will appear in the main toolbar.
   */
  carousel?: boolean;
	/** If true, the focus listener will follow the block instead of itself.
	 *  This can be useful if the block is being used in a carousel and it isn't
	 *  obvious where the user should click.
	 */
	watchBlock?: boolean;
  /** Specifies which controls to show */
  showControls?: ("add" | "remove" | "carousel" | "move")[];
  /** A callback that sends the most current version of the data */
  onChange: (value: T[]) => void;
  /** @inheritdoc */
  children: (props: ChildProps<T>) => React.Element;
  /** If true, the internal renderer will be disabled and the inner blocks
   *  will be used instead. */
  innerBlocks?: false;
	/** If provided, the active item will link to others with the same name.  */
	link?: string;
  [remaining: string]: any;
}

export interface NestedComponentsInnerBlockProps
  extends Pick<
    NestedComponentsProps<never>,
    "className" | "slotName" | "horizontal" | "element" | "carousel"
  > {
  /** If true, the internal renderer will be disabled and the inner blocks
   *  will be used instead. */
  innerBlocks: true;

	/** The ID of the block this component is hosted in. */
	clientId: string;

	/** The block instance type to use. */
	allowedBlock: string; 
}

/**
 * A utility element that handles adding/removing children
 * without the use of Gutenberg blocks. Useful for blocks
 * that wish to have more finite control over children.
 * 
 * Note: The innerBlocks feature is experimental and not fully implemented.
 */
export function NestedComponents<K extends any, T extends NestedComponentsProps<K> | NestedComponentsInnerBlockProps = NestedComponentsProps<K>>
	(props: T extends NestedComponentsProps<K> ? NestedComponentsProps<K> : NestedComponentsInnerBlockProps): React.Element {
	const { innerBlocks } = props;

	return (
		<>
			<SaveOnly>
				{innerBlocks ? (
					<InnerBlocks.Content />
				) : (
					<NestedSave {...props as NestedComponentsProps<K>} />
				)}
			</SaveOnly>
			<EditOnly>
				{innerBlocks ? (
					<NestedInnerBlockEditor {...props as NestedComponentsInnerBlockProps} />
				) : (
					<NestedEditor {...props as NestedComponentsProps<K>} />
				)}
			</EditOnly>
		</>
	);
};

export default NestedComponents;