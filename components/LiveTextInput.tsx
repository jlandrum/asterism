import React, { useState, useRef } from '@wordpress/element';

import './LiveTextInput.scss';
import { EditOnly, SaveOnly } from './SwiftState';
import {
  URLPopover as _URLPopover,
  // @ts-ignore Types are out of date
  __experimentalLinkControl,
} from "@wordpress/block-editor";
import {
  Popover,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarItem,
	Fill
} from "@wordpress/components";

export interface LiveTextInputValue {
  value: string;
  link?: object;
}

interface LiveTextInputProps {
  value?: LiveTextInputValue;
  className?: string;
  onChange: (value: LiveTextInputValue) => void;
  children: any;
  withLink?: boolean;
	useSlot?: string;
} 

// Types definitions are out of date :(
const URLPopover = _URLPopover as any;

const _LiveTextInput = ({
  value,
  className,
  onChange,
  withLink,
  useSlot,
}: LiveTextInputProps): React.Element => {
  const [linkPopover, setLinkPopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);

  function setLink(link: object) {
    onChange({ value: value?.value || "", link });
  }

  return (
    <div className="live-text-input" onFocus={() => setToolbar(true)}>
      <div className="live-text-input__content">
        <span className={`pre ${className}`}>{value?.value}</span>
        <textarea
          className={`${className}`}
          value={value?.value}
          onChange={(e) =>
            onChange({
              ...value,
              value: (e.target as HTMLTextAreaElement).value,
            })
          }
          onFocus={() => setToolbar(true)}
        />
        {toolbar && withLink && !useSlot && (
          <Popover
            placement="top-end"
            id="live-text-input-links"
            focusOnMount={false}
            onClose={() => setToolbar(false)}
          >
            <Toolbar label="LiveTextInput" id="live-text-input">
              <ToolbarGroup>
                <ToolbarButton
                  icon="admin-links"
                  onClick={() => {
                    setLinkPopover(true);
                  }}
                >
                  {linkPopover && (
                    <Popover
                      onClose={() => {
                        setLinkPopover(false);
                      }}
                    >
                      <__experimentalLinkControl
                        onChange={setLink}
                        value={value ? value.link || undefined : undefined}
                      />
                    </Popover>
                  )}
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Popover>
        )}
        {useSlot && withLink && (
          <Fill name={useSlot}>
            <ToolbarButton
              icon="admin-links"
              onClick={() => {
                setLinkPopover(true);
              }}
            >
              {linkPopover && (
                <Popover
                  onClose={() => {
                    setLinkPopover(false);
                  }}
                >
                  <__experimentalLinkControl
                    onChange={setLink}
                    value={value ? value.link || undefined : undefined}
                  />
                </Popover>
              )}
            </ToolbarButton>
          </Fill>
        )}
      </div>
    </div>
  );
};

/**
 * A inline text input that gives the user an indication that the text is editable.
 */
const LiveTextInput = (props: LiveTextInputProps) => (
	<>
		<SaveOnly>
			{props.children}
		</SaveOnly>
		<EditOnly>
		  <_LiveTextInput {...props} />
		</EditOnly>
	</>
)

export default LiveTextInput;
