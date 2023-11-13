import React, { useState, useId, useEffect } from "@wordpress/element";
import {
	Popover,
	Toolbar,
	ToolbarGroup,
	ToolbarButton,
	Slot,
	Fill
} from "@wordpress/components";
import { chevronUp, chevronDown, chevronLeft, chevronRight, trash as close, plus as plus } from "@wordpress/icons";
import { CaptureFocus, useFocusManager } from "../FocusManager/FocusManager";
import { NestedComponentsProps } from "./NestedComponents";

export const NestedEditor = <T,>({
	value: _value, 
	emptyObject = { } as T, 
	className, 
	slotName: _slotName, 
	maxItems, 
	carousel, 
	horizontal = false, 
	onChange, 
	children, 
	element, 
	innerBlocks, 
	useSlot,
	link,
	showControls = ['add', 'remove', 'carousel', 'move'],
	...remaining
}: NestedComponentsProps<T>) => {
	const instanceId = useId();
	const [showToolbar, setShowToolbar] = useState(false);
	const [activeItem, setActiveItem] = useState(-1);
	const [activeCarouselItem, setActiveCarouselItem] = useState(0);
	const [blockId, setBlockId] = useState("");

	const value = _value || [emptyObject];
	const linkId = link ? `${link}_${blockId}` : undefined;

	const focusManager = useFocusManager(
		() => {setShowToolbar(false) },
		() => {setShowToolbar(true); }
	);

	function addChild() {
			if (value) {
		onChange([...value, { ...emptyObject }]);
			} else {
		onChange([{ ...emptyObject }]);
			}
	setActiveCarouselItem(value.length);
	setActiveItem(value.length);
	}

	function removeChild(atIndex: number) {
		onChange(value.filter((_, index) => index !== atIndex));
	}

	function moveChild(fromIndex: number, toIndex: number) {
			const newChildren = [...value];
	const [child] = newChildren.splice(fromIndex, 1);
	newChildren.splice(toIndex, 0, child);
	onChange(newChildren);
	}

	function moveUp() {
		moveChild(activeItem, activeItem - 1);
	setActiveItem(activeItem - 1);
	}

	function moveDown() {
		moveChild(activeItem, activeItem + 1);
	setActiveItem(activeItem + 1);
	}

	const updateChild = (atIndex: number) => (partialChanges: Partial<T>) => {
		const newChildren = [...value];
		newChildren[atIndex] = {...newChildren[atIndex], ...partialChanges };
		onChange(newChildren);
	};

	const nextItem = () => {
			setActiveCarouselItem(activeCarouselItem + 1);
		setActiveItem(activeCarouselItem + 1);
	};

	const prevItem = () => {
			setActiveCarouselItem(activeCarouselItem - 1);
		setActiveItem(activeCarouselItem - 1);
	};

	const removeCurrentItem = () => {
		removeChild(activeItem);
		if (activeItem === value.length - 1) {
			setActiveItem((activeItem - 1 + value.length) % value.length);
			setActiveCarouselItem((activeCarouselItem - 1 + value.length) % value.length);
		}
	};

	useEffect(() => {
		if (link) {
			const targets = Array.from(document.querySelectorAll(`[data-linkid='${linkId}']`));
			const observer = new MutationObserver((mutationsList) => {
				for (let mutation of mutationsList) {
					if (mutation.type === "attributes" && mutation.attributeName === "data-active-item") {
						const targetItem = parseInt(
							// @ts-ignore
              mutation.target.getAttribute("data-active-item")
            );
						setActiveItem(targetItem);
						setActiveCarouselItem(targetItem);
					}
				}
			});
			for (let target of targets) {
				observer.observe(target, { attributes: true });
			}
			return () => {
				observer.disconnect();
			};
		}
	}, [link, activeItem]);

	useEffect(() => {
		let currentElement = focusManager.ref;
		if (!currentElement || blockId) return;

		while (currentElement !== null) {
			if (currentElement.getAttribute('data-block')) {
				break;
			}
			currentElement = currentElement.parentElement;
		}

		if (currentElement) {
			setBlockId(currentElement.getAttribute('data-block'));
		}
	}, [focusManager.ref]);

	const slotName = _slotName || `nested_components_${instanceId}`;
	const targetInnserSlot = useSlot || slotName;

	return (
		<div
			data-linkid={linkId}
			data-active-item={activeItem}
			{...focusManager.props}
			className={["nested-components", className].join(" ")}
			tabIndex={0}
			{...remaining}
		>
			{value?.map?.((v, i) =>
				carousel && activeCarouselItem !== i ? (
					undefined
				) : (
					<CaptureFocus
						element={element}
						className={i === activeItem ? "nested-components__active" : ""}
						onFocus={() => setActiveItem(i)}
						key={i}
					>
						{children({
							value: v,
							index: i,
							active: i === activeItem,
							toolbarVisible: showToolbar,
							update: updateChild(i),
							slot: `${slotName}_${i}`,
						})}
					</CaptureFocus>
				)
			)}
			{showToolbar && !useSlot && (
				<>
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
									<Slot name={targetInnserSlot} />
							</Toolbar>
							<Toolbar label="Inner Actions">
								<Slot name={`${slotName}_${activeItem}`} />
							</Toolbar>
						</div>
					</Popover>
				</>
			)}
			<Fill name={targetInnserSlot}>
				{(showControls.includes('add') || showControls.includes('remove')) && (
					<ToolbarGroup>
						{showControls.includes('add') && (
							<ToolbarButton label="Add" icon={plus} onClick={addChild} />
						)}
						{showControls.includes('remove') && (
							<ToolbarButton
								label="Remove"
								icon={close}
								// disabled={activeItem < 0 || value.length <= 1}
								onClick={removeCurrentItem}
							/>
						)}
					</ToolbarGroup>
				)}
				{!carousel && showControls.includes('move') && (
					<ToolbarGroup>
						<ToolbarButton
							icon={horizontal ? chevronLeft : chevronUp}
							label={horizontal ? "Move Item Left" : "Move Item Up"}
							onClick={moveUp}
						/>
						<ToolbarButton
							icon={horizontal ? chevronRight : chevronDown}
							label={horizontal ? "Move Item Right" : "Move Item Down"}
							onClick={moveDown}
						/>
					</ToolbarGroup>
				)}
				{carousel && showControls.includes('carousel') && (
					<ToolbarGroup>
						<ToolbarButton
							disabled={activeCarouselItem === 0}
							icon={chevronLeft}
							label="Previous Item"
							onClick={prevItem}
						/>
						<ToolbarButton style={{ pointerEvents: "none" }}>
							{Math.max(0, activeItem) + 1} / {value?.length || 0}
						</ToolbarButton>
						<ToolbarButton
							disabled={activeCarouselItem === value.length - 1}
							icon={chevronRight}
							label="Next Item"
							onClick={nextItem}
						/>
					</ToolbarGroup>
				)}
			</Fill>
		</div>
	);
};
