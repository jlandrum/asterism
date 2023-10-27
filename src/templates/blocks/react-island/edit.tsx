import React from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
import "./editor.scss";
import { Editor } from "./$$component$$";

export default function Edit({ attributes, setAttributes }: any) {
  return (
		<div {...useBlockProps()}>
			<Editor
				{...attributes}
				setAttributes={setAttributes}
			/>
		</div>
  );
}
