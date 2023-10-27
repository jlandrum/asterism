import React from "react";
import { useBlockProps } from "@wordpress/block-editor";
import $$component$$ from "./$$component$$";

export default function save({ attributes }: any) {
  return (
		<$$component$$
			{...attributes}
			blockProps={useBlockProps.save}
		/>
  );
}
