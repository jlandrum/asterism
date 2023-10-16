import React from '@wordpress/element';
import { JsxChild, JsxElement } from "typescript";
import { useState } from "@wordpress/element";

import './LiveTextInput.scss';
import { useSwiftState } from './SwiftState';

interface LiveTextInputProps {
	value?: string;
	className: string;
  onChange: (string) => void;
	children: any;
} 

/**
 * A inline text input that gives the user an indication that the text is editable.
 * @returns 
 */
const LiveTextInput = ({
  value,
  className,
  children,
  onChange,
}: LiveTextInputProps): React.Element => {
	const save = useSwiftState();
	
  if (save) {
    return children;
  } else {
		return (
      <div className="live-text-input">
				<span className={`pre ${className}`}>
					{value}
				</span>
        <textarea
          className={`${className}`}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </div>
    );
	}
};

export default LiveTextInput;
