import React, { useState } from "react";
import { EditOnly, SaveOnly } from "./SwiftState";
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import {
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
	Slot,
} from "@wordpress/components";

import './NestedComponents.scss';
import { chevronUp, chevronDown, chevronLeft, chevronRight, close } from "@wordpress/icons";

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
	onChange: (value: T[]) => void;
	children: (value: T, index?: number, update?: (obj:Partial<T>) => void) => React.ReactNode;
}

const NestedEditor = <T,>({
  value,
  emptyObject = {} as T,
  className,
  slotName,
  onChange,
  children,
}: NestedComponentsProps<T>) => {
  const [toolbar, setToolbar] = useState(-1);

  function addChild() {
    onChange([...value, { ...emptyObject }]);
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

  const updateChild = (atIndex: number) => (partialChanges: Partial<T>) => {
    const newChildren = [...value];
    newChildren[atIndex] = { ...newChildren[atIndex], ...partialChanges };
    onChange(newChildren);
  };

  return (
    <>
      <div className={`nested-components ${className}`}>
        {value.map((v, i) => (
          <div key={i} onFocus={() => setToolbar(i)}>
            {toolbar === i && (
              <Popover onClose={() => setToolbar(-1)} placement="top-start">
                <Toolbar
                  label="NestedEditor"
                  id="nestedEditor"
                  className={toolbar === i ? "open" : ""}
                >
                  <ToolbarGroup>
                    <ToolbarButton
                      icon={close}
                      onClick={() => {
                        removeChild(i);
                      }}
                    ></ToolbarButton>
                  </ToolbarGroup>
                  {slotName && (
                    <ToolbarGroup>
                      <Slot name={`${slotName}_${i}`} />
                    </ToolbarGroup>
                  )}
                </Toolbar>
              </Popover>
            )}
            {children(v, i, updateChild(i))}
          </div>
        ))}
      </div>
      <Button icon={plus} variant="tertiary" onClick={addChild} />
    </>
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
const NestedComponents = <T,>(props: NestedComponentsProps<T>) => {
	const { className, value, children } = props;

	return (
    <>
      <SaveOnly>
        <div className={className}>{value.map((v,i) => children(v,i))}</div>
      </SaveOnly>
      <EditOnly>
				<NestedEditor {...props} />
      </EditOnly>
    </>
  );
};

export default NestedComponents;