import React, { useState, useRef, useId, useEffect } from '@wordpress/element';
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
import { useFocusManager } from "../FocusManager/FocusManager";

export const LiveTextEmptyLink = {
  text: "Link",
  link: undefined,
};

interface Link {
	url: string; 
	id: number; 
	opensInNewTab?: boolean;
}

export interface LiveTextValue {
  text: string;
  link?: Link;
}

interface LiveTextInputProps {
  value?: LiveTextValue;
  className?: string;
  onChange: (value: LiveTextValue) => void;
  children: React.Element;
  useSlot?: string;
  asLink?: boolean;
}

const _LiveTextInput = ({
  value: _value,
  className,
  onChange,
  asLink = false,
  useSlot,
  children,
}: LiveTextInputProps): React.Element => {
  const [linkPopover, setLinkPopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);
	const [classes, setClasses] = useState('');

  const ref = useRef<any>();
  const childRef = useRef<any>();
  const instanceId = useId();

  const clickDetector = useFocusManager(
    () => setToolbar(false),
    () => setToolbar(true)
  );

	const value = typeof _value === 'string' ? { text: _value } : _value;

  const innerSlot = useSlot || `live-text-input-toolbar-${instanceId}`;

  function setLink(link: Link) {
		onChange({ text: value?.text || '', link });
  }

  function setValue(newValue: string) {
    onChange({ ...(value || {}), text: newValue });
  }

	useEffect(() => {
		setClasses(childRef.current.children[0].classList.toString());
	}, [children]);

  return (
    <div className="live-text-input" {...clickDetector.props}>
      <div className="live-text-input__content" ref={ref}>
        <span ref={childRef} className={`pre ${className}`}>
          {children}
        </span>
        <textarea
          className={classes}
          value={value?.text || ''}
					autoFocus
          onChange={(v) => setValue(v.target.value)}
          onFocus={() => setToolbar(true)}
          onClick={(e) => e.stopPropagation()}
        />
        {!useSlot && asLink && toolbar && (
          <Popover
            // anchor={clickDetector.ref}
						animate={false}
						// @ts-ignore
            placement="top-center"
            variant="unstyled"
						offset={12}
            focusOnMount={false}
          >
            <Toolbar label="Live Text Input">
              <Slot name={innerSlot} />
            </Toolbar>
          </Popover>
        )}
        {asLink && (
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
export const LiveTextInput = (props: LiveTextInputProps) => (
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
