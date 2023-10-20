import React, { useState } from '@wordpress/element';

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
  link?: { url: string; id: number; opensInNewTab?: boolean };
}

type LiveTextVarTypes = string | LiveTextInputValue;

interface LiveTextInputProps<T extends LiveTextVarTypes> {
  value?: T;
  className?: string;
  onChange: (value: T) => void;
  children: any;
  useSlot?: string;
	asLink?: boolean;
}

const _LiveTextInput = <T extends LiveTextVarTypes = string>({
  value,
  className,
  onChange,
  asLink = false,
  useSlot,
}: LiveTextInputProps<T>): React.Element => {
  const [linkPopover, setLinkPopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);

	const unwrapValue = asLink
		? (value as LiveTextInputValue).value
    : (value as string);

	function setLink(link: T) {
		if (asLink) {
			onChange({ value: (value as LiveTextInputValue).value, link } as T);
		} else {
			onChange(value as T);
		}
	}

	function setValue(newValue: T) {
		if (asLink) {
			console.error(asLink, 'hit');
			onChange({ link: (value as LiveTextInputValue).link, value: newValue } as T);
		} else {
			onChange(newValue as T);
		}
	}

  return (
    <div className="live-text-input" onFocus={() => setToolbar(true)}>
      <div className="live-text-input__content">
        <span className={`pre ${className}`}>{unwrapValue}</span>
        <textarea
          className={`${className}`}
          value={unwrapValue}
          // @ts-ignore
          onChange={(v) => setValue(v.target.value)}
          onFocus={() => setToolbar(true)}
        />
        {toolbar && asLink && !useSlot && (
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
                        // Disable open in new window as it breaks gutenberg :(
                        settings={[]}
                        value={value ? value.link || undefined : undefined}
                      />
                    </Popover>
                  )}
                </ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Popover>
        )}
        {useSlot && asLink && (
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
                    // Disable open in new window as it breaks gutenberg :(
                    settings={[]}
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
const LiveTextInput = <T,>(props: LiveTextInputProps<LiveTextVarTypes>) => (
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
