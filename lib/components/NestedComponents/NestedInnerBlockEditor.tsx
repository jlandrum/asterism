import React, { useState, useEffect } from "@wordpress/element";
import {
  useBlockProps,
  useInnerBlocksProps,
	store,
} from "@wordpress/block-editor";
import { createBlock } from "@wordpress/blocks";
import {
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Slot,
} from "@wordpress/components";
import { useSelect, select, dispatch } from "@wordpress/data";
import { useFocusManager } from "../FocusManager/FocusManager";
import { plus, chevronLeft, chevronRight, close } from '@wordpress/icons';
import { NestedComponentsInnerBlockProps } from "./NestedComponents";

export const NestedInnerBlockEditor = ({ carousel, allowedBlock }: NestedComponentsInnerBlockProps) => {	
	const [showToolbar, setShowToolbar] = useState(false);
	const [activeCarouselItem, setActiveCarouselItem] = useState(0);
	
  const blockProps = useBlockProps();
	const focusManager = useFocusManager(
		() => {setShowToolbar(false)},
		() => {setShowToolbar(true)}
	);

	const innerBlockProps = useInnerBlocksProps(blockProps, {
    renderAppender: undefined,
    allowedBlocks: [allowedBlock],
		template: [[allowedBlock]],
  });

	// @ts-ignore
	const clientId = blockProps.id.slice(6);
	const blockCount = useSelect(store, [blockProps]).getBlockCount(clientId);
	const childHostId = `${innerBlockProps.id}-children`;

	useEffect(() => {
		if (blockCount === 0) {
			addItem();
		}
		if (activeCarouselItem + 1 >= blockCount) {
			setActiveCarouselItem(blockCount - 1);
		}
  }, [blockCount, activeCarouselItem]);

	function prevItem() {
		setActiveCarouselItem(Math.max(0, activeCarouselItem - 1));
	}

	function nextItem() {
		setActiveCarouselItem(Math.min(blockCount, activeCarouselItem + 1));
	}

	function addItem() {
		const newBlock = createBlock(allowedBlock, {});
		dispatch("core/block-editor").insertBlock(newBlock, activeCarouselItem + 1, clientId);
		setActiveCarouselItem(activeCarouselItem + 1);
	}

	function removeCurrentItem() {
    const blockNode = focusManager.ref?.querySelector?.(`#${childHostId} > *:nth-child(${activeCarouselItem + 1})`)
		const blockId = blockNode?.attributes?.getNamedItem("data-block").value;
    if (blockId) {
			dispatch("core/block-editor").removeBlock(blockId);
		}
		activeCarouselItem > 0 && setActiveCarouselItem(activeCarouselItem - 1);
  }

	return (
    <div {...focusManager.props} tabIndex={0}>
      <style>
        {`
					#${childHostId} > *:not(:nth-child(${activeCarouselItem + 1})) {
						display: none;
					}
				`}
      </style>
      <div id={childHostId}>{innerBlockProps.children as any}</div>
      {showToolbar && (
        <Popover
          variant="unstyled"
          placement="top-end"
          offset={12}
          focusOnMount={false}
          animate={false}
        >
          <div className="nested-components__toolbar">
            <Toolbar
              label="Nested Components"
              style={{ backgroundColor: "white" }}
            >
              <ToolbarGroup>
                <ToolbarButton label="Add" icon={plus} onClick={addItem} />
                <ToolbarButton
                  label="Remove"
                  icon={close}
                  disabled={blockCount <= 1}
                  onClick={removeCurrentItem}
                />
              </ToolbarGroup>
              {!carousel && (
                <ToolbarGroup>
                  {/* <ToolbarButton
                    icon={horizontal ? chevronLeft : chevronUp}
                    label={horizontal ? "Move Item Left" : "Move Item Up"}
                    onClick={moveUp}
                  />
                  <ToolbarButton
                    icon={horizontal ? chevronRight : chevronDown}
                    label={horizontal ? "Move Item Right" : "Move Item Down"}
                    onClick={moveDown}
                  /> */}
                </ToolbarGroup>
              )}
              {carousel && (
                <ToolbarGroup>
                  <ToolbarButton
                    disabled={activeCarouselItem === 0}
                    icon={chevronLeft}
                    label="Previous Item"
                    onClick={prevItem}
                  />
                  <ToolbarButton style={{ pointerEvents: "none" }}>
                    {Math.max(0, activeCarouselItem) + 1} / {blockCount}
                  </ToolbarButton>
                  <ToolbarButton
                    disabled={activeCarouselItem === blockCount - 1}
                    icon={chevronRight}
                    label="Next Item"
                    onClick={nextItem}
                  />
                </ToolbarGroup>
              )}
            </Toolbar>
            <Toolbar label="Inner Actions">
              {/* <Slot name={`${slotName}_${activeItem}`} /> */}
            </Toolbar>
          </div>
        </Popover>
      )}
    </div>
  );
};
