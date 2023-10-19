import React from "react";
import { useBlockProps } from "@wordpress/block-editor";
import { SwiftState } from "wpasterism/components/SwiftState";
import $$component$$ from "./$$component$$";

export default function save({ attributes }: any) {
  return (
    <SwiftState save={true}>
      <$$component$$
				{...attributes}
        blockProps={useBlockProps.save()}
      />
    </SwiftState>
  );
}
