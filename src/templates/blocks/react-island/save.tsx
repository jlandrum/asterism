import React from "react";
import { useBlockProps } from "@wordpress/block-editor";
import { View } from "./$$component$$";

export default function save({ attributes }: any) {
  return (
		<div
			data-attributes={btoa(JSON.stringify(attributes))}
			{...useBlockProps.save()}>
			<View {...attributes} />
		</div>
  );
}
