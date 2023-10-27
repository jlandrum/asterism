import React from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
import "./editor.scss";
import $$component$$ from "./$$component$$";

export default function Edit({ attributes, setAttributes }: any) {
  return (
		<$$component$$
			{...attributes}
			blockProps={useBlockProps}
			setAttributes={setAttributes}
		/>
  );
}
