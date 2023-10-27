import React from "react";

import { useBlockProps } from "@wordpress/block-editor";

interface $$component$$Props {
	// Gutenberg Attributes
  blockProps: (args?: any) => ReturnType<typeof useBlockProps | typeof useBlockProps.save>;
  setAttributes?: (data: any) => void;
}

const $$component$$ = ({
  blockProps,
  setAttributes,
}: $$component$$Props) => {
  return <div {...blockProps({className: "$$slug$$"})}>Hello World!</div>;
};

export default $$component$$;
