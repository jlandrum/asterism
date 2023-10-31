import React, { useState, useId, useRef, useEffect } from '@wordpress/element';

import { EditOnly, SaveOnly } from '../RenderScope/RenderScope';
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
	Fill
} from "@wordpress/components";
import { ClickDetector, useClickDetector } from '../ClickDetector/ClickDetector';

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
	const ref = useRef<any>();
	const id = useId();

	useEffect(() => {
		if (typeof value === 'string' && asLink) {
			onChange({ value, link: undefined } as T);
		}
	}, [value]);

	const innerSlot = useSlot || `live-text-input-toolbar-${id}`;

	const unwrapValue = asLink
		? (value as LiveTextInputValue)?.value
    : (value as string);

	function setLink(link: T) {
		if (asLink) {
			onChange({ value: (value as LiveTextInputValue).value, link } as unknown as T);
		} else {
			onChange(value as T);
		}
	}

	function setValue(newValue: T) {
		if (asLink) {
			console.error(asLink, 'hit');
			onChange({ link: (value as LiveTextInputValue)?.link, value: newValue } as T);
		} else {
			onChange(newValue as T);
		}
	}

	const clickDetector = useClickDetector(() => {
		setToolbar(false);
	}, () => { setToolbar(true); });

  return (
		<div className="live-text-input" {...clickDetector}>
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
				{asLink && (
					<Fill name={innerSlot}>
						<div className="components-toolbar-group">
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
						</div>
					</Fill>
				)}
			</div>
		</div>
  );
};

/**
 * A inline text input that gives the user an indication that the text is editable.
 */
export const LiveTextInput = <T,>(props: LiveTextInputProps<LiveTextVarTypes>) => (
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
