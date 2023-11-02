import React, {
  useState,
  useRef,
  useEffect,
  createElement,
	Fragment
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

import { chevronUp, chevronDown, chevronLeft, chevronRight, trash as close, plus as plus } from "@wordpress/icons";
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
  const [activeItem, setActiveItem] = useState(-1);
	const [toolbar, setToolbar] = useState(false);
	const popoverAnchor = useRef<any[]>([]);
  
	const valueSafe = !value || value.length === 0 ? [{ ...emptyObject }] : value;

	useEffect(() => {
		if (carousel && value && value.length < activeItem) {
			setActiveItem(value.length - 1);
		}
	}, [value]);
	
	
	const clickDetector = useClickDetector(() => {
    setActiveItem(-1);
    setToolbar(false);
  }, () => {
		setToolbar(true);
	});
	
  function addChild() {
		if (valueSafe) {
      onChange([...valueSafe, { ...emptyObject }]);
    } else {
      onChange([{ ...emptyObject }]);
    }
  }

  function removeChild(atIndex: number) {
    onChange(valueSafe.filter((_, index) => index !== atIndex));
		setActiveItem(-1);
  }

  function moveChild(fromIndex: number, toIndex: number) {
    const newChildren = [...valueSafe];
    const [child] = newChildren.splice(fromIndex, 1);
    newChildren.splice(toIndex, 0, child);
		setActiveItem(toIndex);
    onChange(newChildren);
  }

	function moveUp(index: number) {
		if (index > 0) {
			moveChild(index, index - 1);
		}
	}

	function moveDown(index: number) {
		if (index < valueSafe.length - 1) {
      moveChild(index, index + 1);
    }
	}

  const updateChild = (atIndex: number) => (partialChanges: Partial<T>) => {
    const newChildren = [...valueSafe];
    newChildren[atIndex] = { ...newChildren[atIndex], ...partialChanges };
    onChange(newChildren);
  };

	 const handleFocus = (index: number) => () => {
		if (activeItem !== index) {
			setActiveItem(index)
		}
	}

	const nextItem = () => {
		setActiveItem((activeItem + 1) % valueSafe.length);
	}

	const prevItem = () => {
		setActiveItem((activeItem - 1 + valueSafe.length) % valueSafe.length);
	}

	const removeCurrentItem = () => {
		removeChild(activeItem);
		setActiveItem((activeItem - 1 + valueSafe.length) % valueSafe.length);
	}

	const activeCarousel = activeItem === -1 ? 0 : Math.min(activeItem, valueSafe.length - 1);

	const Host: any = element || 'div';
	
  return (
    <div
      className={`nested-components ${className ? className : ""}`}
      tabIndex={0}
      {...clickDetector}
      {...remaining}
    >
      {(valueSafe || []).map((v, i) =>
        (carousel && activeCarousel === i) || !carousel ? (
          <Host
            key={i}
            tabIndex={0}
            onFocus={handleFocus(i)}
            ref={(ref: any) => (popoverAnchor.current[i] = ref)}
          >
            {activeItem === i && !carousel && (
              <Popover
                placement="top-start"
                anchor={popoverAnchor.current[i]}
                focusOnMount={false}
                variant="unstyled"
              >
                <div className="nested-components__carousel-toolbar">
                  <Toolbar
                    label="Nested Editor"
                    id="nestedEditor"
                    className={activeCarousel === i ? "open" : ""}
                  >
                    <Slot name={`${slotName}_core`} />
                  </Toolbar>
                  <Toolbar
                    label="Nested Editor Commands"
                    style={{ backgroundColor: "white" }}
                  >
                    <ToolbarGroup>
                      <ToolbarButton
                        icon={horizontal ? chevronLeft : chevronUp}
                        label={horizontal ? "Move to Previous" : "Move Up"}
                        onClick={() => {
                          moveUp(i);
                        }}
                      ></ToolbarButton>
                      <ToolbarButton
                        icon={horizontal ? chevronRight : chevronDown}
                        label={horizontal ? "Move to Next" : "Move Down"}
                        onClick={() => {
                          moveDown(i);
                        }}
                      ></ToolbarButton>
                    </ToolbarGroup>
                    <Slot name={`${slotName}_${activeCarousel}`} />
                  </Toolbar>
                  <Toolbar label="Additional Actions">
                    <Slot name={`${slotName}`} />
                  </Toolbar>
                </div>
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
      {toolbar && carousel && (
        <Popover placement="top-end" variant="unstyled">
          <div className="nested-components__carousel-toolbar">
            <Toolbar label="Nested Editor Commands" id="nestedEditor">
              <Slot name={`${slotName}_core`} />
            </Toolbar>
            <Toolbar label="Item Actions" style={{ backgroundColor: "white" }}>
              <Slot name={`${slotName}_${activeItem}`} />
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
      {toolbar && activeItem >= 0 && (
        <Fill name={`${slotName}_core`}>
          {carousel && (
            <ToolbarGroup>
              <ToolbarButton
                icon={chevronLeft}
                onClick={prevItem}
                label="Move to Previous Item"
              />
              <ToolbarButton style={{ pointerEvents: "none" }}>
                {activeCarousel + 1} / {valueSafe?.length || 0}
              </ToolbarButton>
              <ToolbarButton
                icon={chevronRight}
                onClick={nextItem}
                label="Move to Next Item"
              />
            </ToolbarGroup>
          )}
          <ToolbarGroup>
            <ToolbarButton
              icon={plus}
              onClick={addChild}
              disabled={(maxItems && valueSafe?.length >= maxItems) || false}
              label="Add New Item"
            />
            <ToolbarButton
              icon={close}
              onClick={removeCurrentItem}
              label="Delete Current Item"
            />
          </ToolbarGroup>
        </Fill>
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