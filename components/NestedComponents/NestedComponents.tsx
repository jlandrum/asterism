import React, {
  useState,
  useRef,
  useEffect,
  createElement,
} from "@wordpress/element";

import { EditOnly, EditOnlyWrapper, SaveOnly } from "../SwiftState/SwiftState";
import {
	Button,
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  Slot,
  SlotFillProvider,
} from "@wordpress/components";

import { chevronUp, chevronDown, chevronLeft, chevronRight, close, plus } from "@wordpress/icons";
import { ClickDetector } from "../ClickDetector/ClickDetector";

/**
 * NestedComponentsProps type.
 * @typedef {object} NestedComponentsProps
 * @property {string} value - The object that holds the data for the nested components
 */
interface NestedComponentsProps<T> {
  value: T[];
  emptyObject?: T;
  className?: string;
  slotName?: string;
  horizontal?: boolean;
	maxItems?: number;
	element?: string;
	carousel?: boolean;
  onChange: (value: T[]) => void;
  children: (
    value: T,
    index?: number,
		slot?: string,
    update?: (obj: Partial<T>) => void
  ) => React.ReactNode;
	[remaining: string]: any;
}

const NestedEditor = <T,>({
  value,
  emptyObject = {} as T,
  className,
  slotName,
	maxItems,
	carousel,
	horizontal = false,
  onChange,
  children,
}: NestedComponentsProps<T>) => {
  const [childToolbar, setChildToolbar] = useState(-1);
	const [toolbar, setToolbar] = useState(false);
	const [carouselItem, setCarouselItem] = useState(0);

	const popoverAnchor = useRef<any[]>([]);
	const host = useRef<any>([]);

  function addChild() {
    onChange([...value, { ...emptyObject }]);
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

  return (
    <ClickDetector
      onOuterClick={() => {
        setChildToolbar(-1);
        setToolbar(false);
      }}
    >
      <div
        className={`nested-components ${className ? className : ""}`}
        tabIndex={0}
        ref={host}
        onClick={() => setToolbar(true)}
      >
        {value.map((v, i) =>
          (carousel && i === carouselItem) || !carousel ? (
            <div
              key={i}
              tabIndex={0}
              onFocus={handleFocus(i)}
              ref={(ref) => (popoverAnchor.current[i] = ref)}
            >
              {childToolbar === i && !carousel && (
                <Popover
                  // onClose={() => setToolbar(-1)}
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
                    {slotName && (
                      <Slot name={`${slotName}_${i}`} bubblesVirtually />
                    )}
                  </Toolbar>
                </Popover>
              )}
              {children(v, i, `${slotName}_${i}`, updateChild(i))}
            </div>
          ) : undefined
        )}
        {toolbar && (
          <Popover placement="top-end">
            <Toolbar label="Nedted Editor" id="nestedEditor">
              {carousel && (
                <ToolbarGroup>
                  <ToolbarButton icon={chevronLeft} onClick={prevItem} />
                  <ToolbarButton>
                    {carouselItem + 1} / {value.length}
                  </ToolbarButton>
                  <ToolbarButton icon={chevronRight} onClick={nextItem} />
									<ToolbarButton icon={close} onClick={removeCurrentItem} />
                </ToolbarGroup>
              )}
              <ToolbarGroup>
                <ToolbarButton icon={plus} onClick={addChild} />
              </ToolbarGroup>
            </Toolbar>
          </Popover>
        )}
      </div>
    </ClickDetector>
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
 * @param {string} props.slotName - If provided, the editor menu will appear in the slot provided. Useful if combining with LiveTextInput.
 * @param {string} props.onChange - The function to call when the children change
 * @returns {React.ReactElement} The NestedComponents component
 */
export const NestedComponents = <T,>(props: NestedComponentsProps<T>) => {
	const { className, value, children, element = 'div', ...remaining } = props;
	
	return (
    <>
      <SaveOnly>
        {createElement(element, { className, ...remaining }, value.map((v, i) => children(v, i)))}
      </SaveOnly>
      <EditOnly {...remaining}>
        <NestedEditor {...props} />
      </EditOnly>
    </>
  );
};

export default NestedComponents;