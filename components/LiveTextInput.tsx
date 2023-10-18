import React from '@wordpress/element';
import { JsxChild, JsxElement } from "typescript";
import { useState } from "@wordpress/element";

import './LiveTextInput.scss';
import { useSwiftState } from './SwiftState';
import { URLInput, URLInputButton } from '@wordpress/block-editor';

interface LiveTextInputProps {
	value?: string;
	link?: string;
	className?: string;
  onChange: (string: string) => void;
  onLinkChange?: (url: string) => void;
	children: any;
	withLink?: boolean;
} 

/**
 * A inline text input that gives the user an indication that the text is editable.
 * @returns 
 */
const LiveTextInput = ({
  value,
	link,
  className,
  children,
  onChange,
	onLinkChange,
	withLink,
}: LiveTextInputProps): React.Element => {
	const save = useSwiftState();
	
  if (save) {
    return children;
  } else {
		return (
      <div className="live-text-input">
        <span className={`pre ${className}`}>{value}</span>
        <textarea
          className={`${className}`}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)} 
        />
        {withLink && (
					<URLInput value={link || ""} onChange={(url) => onLinkChange?.(url)} />
        )}
      </div>
    );
	}
};

export default LiveTextInput;
