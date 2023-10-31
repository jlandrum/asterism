import React, {
  useState,
  useRef,
  useEffect,
  createElement,
} from "@wordpress/element";

import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
import {
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Slot,
} from "@wordpress/components";

import { chevronUp, chevronDown, chevronLeft, chevronRight, close, plus } from "@wordpress/icons";
import { useClickDetector } from "../ClickDetector/ClickDetector";
import './NestedComponents.scss';

interface ChildProps<T> {
	value: T,
	index: number,
	slot?: string,
	update: (obj: Partial<T>) => void
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
  value,
  emptyObject = {} as T,
  className,
  slotName = "nested-editor",
	maxItems,
	carousel,
	horizontal = false,
  onChange,
  children,
	element,
	...remaining
}: NestedComponentsProps<T>) => {
  const [childToolbar, setChildToolbar] = useState(-1);
	const [toolbar, setToolbar] = useState(false);
	const [carouselItem, setCarouselItem] = useState(0);
	const popoverAnchor = useRef<any[]>([]);
  
	useEffect(() => {
		if (!value || value.length === 0) {
			onChange([{ ...emptyObject }]);
		}

		if (value && value.length < carouselItem) {
			setCarouselItem(value.length - 1);
		}
	}, [value]);

	const clickDetector = useClickDetector(() => {
    setChildToolbar(-1);
    setToolbar(false);
  }, () => {
		setToolbar(true);
	});
	
  function addChild() {
		if (value) {
			onChange([...value, { ...emptyObject }]);
		} else {
			onChange([{ ...emptyObject }]);
		}
  }

  function removeChild(atIndex: number) {
    onChange(value.filter((_, index) => index !== atIndex));
		setChildToolbar(-1);
  }

  function moveChild(fromIndex: number, toIndex: number) {
    const newChildren = [...value];
    const [child] = newChildren.splice(fromIndex, 1);
    newChildren.splice(toIndex, 0, child);
		setChildToolbar(toIndex);
    onChange(newChildren);
  }

	function moveUp(index: number) {
		if (index > 0) {
			moveChild(index, index - 1);
		}
	}

	function moveDown(index: number) {
		if (index < value.length - 1) {
			moveChild(index, index + 1);
		}
	}

  const updateChild = (atIndex: number) => (partialChanges: Partial<T>) => {
    const newChildren = [...value];
    newChildren[atIndex] = { ...newChildren[atIndex], ...partialChanges };
    onChange(newChildren);
  };

	 const handleFocus = (index: number) => () => {
		if (childToolbar !== index) {
			setChildToolbar(index)
		}
	}

	const nextItem = () => {
		setCarouselItem((carouselItem + 1) % value.length);
	}

	const prevItem = () => {
		setCarouselItem((carouselItem - 1 + value.length) % value.length);
	}

	const removeCurrentItem = () => {
		removeChild(carouselItem);
		setCarouselItem((carouselItem - 1 + value.length) % value.length);
	}

	const Host: any = element || 'div';
	
  return (
    <div
      className={`nested-components ${className ? className : ""}`}
      tabIndex={0}
      onClick={() => setToolbar(true)}
      {...clickDetector}
      {...remaining}
    >
      {(value || []).map((v, i) =>
        (carousel && i === carouselItem) || !carousel ? (
          <Host
            key={i}
            tabIndex={0}
            onFocus={handleFocus(i)}
            ref={(ref: any) => (popoverAnchor.current[i] = ref)}
          >
            {childToolbar === i && !carousel && (
              <Popover
                placement="top-start"
                anchor={popoverAnchor.current[i]}
                focusOnMount={false}
                variant="unstyled"
              >
                <Toolbar
                  label="Nested Editor Child"
                  id="nestedEditor"
                  className={childToolbar === i ? "open" : ""}
                >
                  <ToolbarGroup>
                    <ToolbarButton
                      icon={close}
                      onClick={() => {
                        removeChild(i);
                      }}
                    ></ToolbarButton>
                  </ToolbarGroup>
                  <ToolbarGroup>
                    <ToolbarButton
                      icon={horizontal ? chevronLeft : chevronUp}
                      onClick={() => {
                        moveUp(i);
                      }}
                    ></ToolbarButton>
                    <ToolbarButton
                      icon={horizontal ? chevronRight : chevronDown}
                      onClick={() => {
                        moveDown(i);
                      }}
                    ></ToolbarButton>
                  </ToolbarGroup>
                  <Slot name={`${slotName}_${i}`} bubblesVirtually />
                </Toolbar>
              </Popover>
            )}
            {children({
              value: v,
              index: i,
              slot: `${slotName}_${i}`,
              update: updateChild(i),
            })}
          </Host>
        ) : undefined
      )}
      {toolbar && (
        <Popover placement="top-end" variant="unstyled">
          <div className="nested-components__carousel-toolbar">
            <Toolbar label="Nested Editor Commands" id="nestedEditor">
              {carousel && (
                <ToolbarGroup>
                  <ToolbarButton
                    icon={chevronLeft}
                    onClick={prevItem}
                    label="Move to Previous Item"
                  />
                  <ToolbarButton style={{ pointerEvents: "none" }}>
                    {carouselItem + 1} / {value?.length || 0}
                  </ToolbarButton>
                  <ToolbarButton
                    icon={chevronRight}
                    onClick={nextItem}
                    label="Move to Next Item"
                  />
                </ToolbarGroup>
              )}
              <ToolbarGroup>
                {carousel && (
                  <ToolbarButton
                    icon={close}
                    onClick={removeCurrentItem}
                    label="Delete Current Item"
                  />
                )}
                <ToolbarButton
                  icon={plus}
                  onClick={addChild}
                  disabled={(maxItems && value?.length >= maxItems) || false}
                  label="Add New Item"
                />
              </ToolbarGroup>
            </Toolbar>
            <Toolbar label="Item Actions" style={{ backgroundColor: "white" }}>
              <Slot name={`${slotName}_${carouselItem}`} />
            </Toolbar>
            <Toolbar
              label="Additional Actions"
              style={{ backgroundColor: "white" }}
            >
              <Slot name={`${slotName}`} />
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
          (value || []).map((v, i) => children({ value: v, index: i, update: () => {} }))
        )}
      </SaveOnly>
      <EditOnly>
        <NestedEditor {...props} {...remaining} />
      </EditOnly>
    </>
  );
};

export default NestedComponents;