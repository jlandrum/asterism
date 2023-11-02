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
import { useClickDetector } from "../ClickDetector/ClickDetector";
import './NestedComponents.scss';

interface ChildProps<T> {
	value: T,
	index: number,
	slot?: string,
	toolbarVisible?: boolean;
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

const NestedElement = ({
  onFocus,
  children,
  element,
  index,
  activeItem,
  slotName,
  horizontal,
  moveUp,
  moveDown,
  showToolbar,
  carousel,
}: any) => {
  const focusListener = useClickDetector(
    () => {},
    () => {
      onFocus(index);
    },
    [activeItem]
  );

  const Host: any = element || "div";

  return (
    <Host key={index} tabIndex={0} {...focusListener.props}>
      {activeItem === index && (
        <Popover
          placement="top-end"
          anchor={focusListener.ref}
          focusOnMount={false}
          variant="unstyled"
        >
          <div className="nested-components__carousel-toolbar">
            <Toolbar
              label="Nested Editor"
              id="nestedEditor"
              className={activeItem === index ? "open" : ""}
            >
              <Slot name={`${slotName}_core`} />
            </Toolbar>
            <Toolbar
              label="Nested Editor Commands"
              style={{ backgroundColor: "white" }}
            >
              {!carousel && (
                <ToolbarGroup>
                  <ToolbarButton
                    icon={horizontal ? chevronLeft : chevronUp}
                    label={horizontal ? "Move to Previous" : "Move Up"}
                    onClick={() => {
                      moveUp(index);
                    }}
                  ></ToolbarButton>
                  <ToolbarButton
                    icon={horizontal ? chevronRight : chevronDown}
                    label={horizontal ? "Move to Next" : "Move Down"}
                    onClick={() => {
                      moveDown(index);
                    }}
                  ></ToolbarButton>
                </ToolbarGroup>
              )}
              <Slot name={`${slotName}_${index}`} />
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
      {children}
    </Host>
  );
};

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
  const [activeItem, setActiveItem] = useState(-1);
	const [showToolbar, setShowToolbar] = useState(false);
	const instanceId = useId();

	const value = !_value || _value.length === 0 ? [{ ...emptyObject }] : _value;

	useEffect(() => {
		if (carousel && value && value.length < activeItem) {
      setActiveItem(value.length - 1);
    }
	}, [value]);
	
	const clickDetector = useClickDetector(() => {
    setShowToolbar(false);
		if (!carousel) {	
			setActiveItem(-1);
		}
  }, () => {
		if (carousel) {
			setShowToolbar(true);
		}
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
		setActiveItem(-1);
  }

  function moveChild(fromIndex: number, toIndex: number) {
    const newChildren = [...value];
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
		if (index < value.length - 1) {
      moveChild(index, index + 1);
    }
	}

  const updateChild = (atIndex: number) => (partialChanges: Partial<T>) => {
    const newChildren = [...value];
    newChildren[atIndex] = { ...newChildren[atIndex], ...partialChanges };
    onChange(newChildren);
  };

	 const handleFocus = useCallback((index: number) => {
		setActiveItem(index);
	}, [setActiveItem]);

	const nextItem = () => {
		setActiveItem((activeItem + 1) % value.length);
	}

	const prevItem = () => {
		setActiveItem((activeItem - 1 + value.length) % value.length);
	}

	const removeCurrentItem = () => {
		removeChild(activeItem);
		setActiveItem((activeItem - 1 + value.length) % value.length);
	}

	const slotName = _slotName || `nested_components_${instanceId}`; 
	
  return (
    <div
      className={`nested-components ${className ? className : ""}`}
      tabIndex={0}
      {...clickDetector.props}
      {...remaining}
    >
      {(value || []).map((v, i) =>
        (carousel && Math.max(0, activeItem) === i) || !carousel ? (
          <NestedElement
            onFocus={handleFocus}
            element={element}
            showToolbar={showToolbar}
            activeItem={carousel ? Math.max(0, activeItem) : activeItem}
            carousel={carousel}
            horizontal={horizontal}
            moveUp={moveUp}
            moveDown={moveDown}
            slotName={slotName}
            updateChild={updateChild}
            index={i}
          >
            {children({
              value: v,
              index: i,
              update: updateChild(i),
              toolbarVisible: showToolbar,
              slot: `${slotName}`,
            })}
          </NestedElement>
        ) : undefined
      )}
      {showToolbar && (
        <Popover
          placement="top-end"
          variant="unstyled"
          anchor={clickDetector.ref}
        >
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
      {showToolbar && (
        <Fill name={`${slotName}_core`}>
          {carousel && (
            <ToolbarGroup>
              <ToolbarButton
                icon={chevronLeft}
                onClick={prevItem}
                label="Move to Previous Item"
              />
              <ToolbarButton style={{ pointerEvents: "none" }}>
                {Math.max(0, activeItem) + 1} / {value?.length || 0}
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
              disabled={(maxItems && value?.length >= maxItems) || false}
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