import React, {
  useState,
  useRef,
  useCallback,
  createElement,
  Fragment,
  useId,
  useEffect,
} from "@wordpress/element";

import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
import {
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Slot,
	Fill,
} from "@wordpress/components";

import { chevronUp, chevronDown, chevronLeft, chevronRight, trash as close, plus as plus, tool } from "@wordpress/icons";
import { CaptureFocus, useFocusManager } from "../FocusManager/FocusManager";
import './NestedComponents.scss';

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
interface NestedComponentsProps<T> {
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
	/** A callback that sends the most current version of the data */
  onChange: (value: T[]) => void;
	/** @inheritdoc */
  children: (props: ChildProps<T>) => React.Element;
  [remaining: string]: any;
}

const NestedEditor = <T,>({
  value: _value,
  emptyObject = {} as T,
  className,
  slotName: _slotName,
	maxItems,
	carousel,
	horizontal = false,
  onChange,
  children,
	element,
	...remaining
}: NestedComponentsProps<T>) => {
	const instanceId = useId();
	const [showToolbar, setShowToolbar] = useState(false);
	const [activeItem, setActiveItem] = useState(-1);
	const [activeCarouselItem, setActiveCarouselItem] = useState(0);
	const value = _value || [emptyObject];

	const focusManager = useFocusManager(
		() => { setShowToolbar(false), setActiveItem(-1) }, 
		() => { setShowToolbar(true) });
	
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
    newChildren[atIndex] = { ...newChildren[atIndex], ...partialChanges };
    onChange(newChildren);
  };

	const nextItem = () => {
		setActiveCarouselItem(activeCarouselItem + 1);
		setActiveItem(activeCarouselItem + 1);
	}
	
	const prevItem = () => {
		setActiveCarouselItem(activeCarouselItem - 1);
		setActiveItem(activeCarouselItem - 1);
	}

	const removeCurrentItem = () => {
		removeChild(activeItem);
		if (activeItem === value.length - 1) {
			setActiveItem((activeItem - 1 + value.length) % value.length);
			setActiveCarouselItem((activeCarouselItem - 1 + value.length) % value.length);
		}
	}

	const slotName = _slotName || `nested_components_${instanceId}`; 

	return (
    <div
      {...focusManager.props}
      className={["nested-components", className].join(" ")}
      tabIndex={0}
      {...remaining}
    >
      {value?.map?.((v, i) =>
        carousel && activeCarouselItem !== i ? undefined : (
          <CaptureFocus
            className={i === activeItem ? "nested-components__active" : ""}
            onFocus={() => setActiveItem(i)}
            key={i}
          >
            {children({
              value: v,
              index: i,
              active: i === activeItem,
              update: updateChild(i),
              slot: `${slotName}_${i}`,
            })}
          </CaptureFocus>
        )
      )}
      {showToolbar && (
        <Popover
          variant="unstyled"
          placement="top-end"
          inline
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
                <ToolbarButton label="Add" icon={plus} onClick={addChild} />
                <ToolbarButton
                  label="Remove"
                  icon={close}
                  disabled={activeItem < 0 || value.length <= 1}
                  onClick={removeCurrentItem}
                />
              </ToolbarGroup>
              {!carousel && (
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
              {carousel && (
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
            </Toolbar>
            <Toolbar label="Inner Actions">
              <Slot name={`${slotName}_${activeItem}`} />
            </Toolbar>
          </div>
        </Popover>
      )}
    </div>
  );
};

/**
 * A utility element that handles adding/removing children
 * without the use of Gutenberg blocks. Useful for blocks
 * that wish to have more finite control over children.
 * @param {string} props.className - The class name for the component
 * @param {string} props.value - The object that holds the data for the nested components
 * @param {string} props.children - The component to render for each child
 * @param {string} props.emptyObject - The object to clone when adding a new child
 * @param {string} props.slotName - Creates a slot allowing items to be hoisted into the toolbar. 
 *                                  The slot name will be appended with the index of the child and
 *     														  and provided to the children as a prop.
 * @param {string} props.onChange - The function to call when the children change
 */
export const NestedComponents = <T,>(props: NestedComponentsProps<T>): React.Element => {
	const { className, value, children, element = 'div', ...remaining } = props;
	
	return (
    <>
      <SaveOnly>
        {createElement(
          element,
          { className, ...remaining },
          (value || []).map((v, i) => <Fragment key={i}>{children({ value: v, index: i, update: () => {} })}</Fragment>)
        )}
      </SaveOnly>
      <EditOnly>
        <NestedEditor {...props} {...remaining} />
      </EditOnly>
    </>
  );
};

export default NestedComponents;