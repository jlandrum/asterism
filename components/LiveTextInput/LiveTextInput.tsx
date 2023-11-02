import React, { useState, useRef, useId } from '@wordpress/element';
import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
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
  Slot,
	Fill,
} from "@wordpress/components";
import { useClickDetector } from '../ClickDetector/ClickDetector';

export interface LiveTextLink {
  value: string;
  link?: { url: string; id: number; opensInNewTab?: boolean };
}

export const LiveTextEmptyLink = {
	value: 'Link',
	link: undefined,
}

type LiveTextAllowedTypes = LiveTextLink | string;

interface LiveTextInputProps<T extends LiveTextAllowedTypes> {
  value?: T;
  className?: string;
  onChange: (value: T) => void;
  children: any;
  useSlot?: string;
	asLink?: boolean;
}

const _LiveTextInput = <T extends LiveTextAllowedTypes>({
  value: _value,
  className,
  onChange,
  asLink = false,
  useSlot,
}: LiveTextInputProps<T>): React.Element => {
  const [linkPopover, setLinkPopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);
	const ref = useRef<any>();
	const instanceId = useId();

	const clickDetector = useClickDetector(
    () => setToolbar(false),
    () => setToolbar(true)
  );

	const value = (() => {
		if (typeof _value === 'string' && asLink) {
			return { value: _value, link: undefined } as T;
		} else if (typeof _value === 'object' && !asLink) {
			return _value.value as T;
		}
		return _value;
	})();

	const innerSlot = useSlot || `live-text-input-toolbar-${instanceId}`;

	const unwrapValue = asLink
		? (value as LiveTextLink)?.value
    : (value as string);

	function setLink(link: T) {
		if (asLink) {
			onChange({ value: (value as LiveTextLink).value, link } as unknown as T);
		} else {
			onChange(value as T);
		}
	}

	function setValue(newValue: T) {
		if (asLink) {
			onChange({ link: (value as LiveTextLink)?.link, value: newValue } as T);
		} else {
			onChange(newValue as T);
		}
	}

  return (
    <div className="live-text-input" {...clickDetector.props}>
      <div className="live-text-input__content" ref={ref}>
        <span className={`pre ${className}`}>{unwrapValue}</span>
        <textarea
          className={`${className}`}
          value={unwrapValue}
          // @ts-ignore
          onChange={(v) => setValue(v.target.value)}
          onFocus={() => setToolbar(true)}
          onClick={(e) => e.stopPropagation()}
        />
        {!useSlot && asLink && toolbar && (
          <Popover
            anchor={ref.current}
            placement="top-start"
            variant="unstyled"
          >
            <Toolbar label="Live Text Input">
              <Slot name={innerSlot} />
            </Toolbar>
          </Popover>
        )}
        {asLink && toolbar && (
          <Fill name={innerSlot}>
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
                    value={value && value.link ? value?.link : undefined}
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
export const LiveTextInput = <T extends LiveTextAllowedTypes = string>(props: LiveTextInputProps<T>) => (
	<>
		<SaveOnly>
			{props.children}
		</SaveOnly>
		<EditOnly>
		  <_LiveTextInput<T > {...props} />
		</EditOnly>
	</>
)

export default LiveTextInput;
