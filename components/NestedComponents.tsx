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

interface NestedComponentsProps<T> {
	value: T[];
	emptyObject?: T;
	direction?: 'horizontal' | 'vertical';
	className?: string;
	slotName?: string;
	onChange: (value: T[]) => void;
	children: (value: T, index?: number, update?: (obj:Partial<T>) => void) => React.ReactNode;
}

/**
 * A utility element that handles adding/removing children
 * without the use of Gutenberg blocks. Useful for blocks
 * that wish to have more finite control over children.
 */
const NestedComponents = <T,>(props: NestedComponentsProps<T>) => {
	const { className, value, children } = props;
	return (
    <>
      <SaveOnly>
        <div className={className}>{value.map((v) => children(v))}</div>
      </SaveOnly>
      <EditOnly>
				<NestedEditor {...props} />
      </EditOnly>
    </>
  );
};

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
          <div onFocus={() => setToolbar(i)}>
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

export default NestedComponents;