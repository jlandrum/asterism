import React from "react";

import { useBlockProps } from "@wordpress/block-editor";
import { useState } from "@yesand/asterism/islands";

interface $$component$$SaveProps {
	hydrate?: boolean;
}

interface $$component$$EditorProps {
	setAttributes?: (data: any) => void;
}

export const Editor = ({setAttributes}: $$component$$EditorProps) => {
  return <div>Hello World!</div>;
};

export const View = ({hydrate}: $$component$$SaveProps) => {
	const [text, setText] = useState("Hello World!")(hydrate);

	return <span onClick={() => setText("It works!")} className="$$slug$$">{text}</span>;
}