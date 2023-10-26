import React from "react";

import { useBlockProps } from "@wordpress/block-editor";

interface $$component$$Props {
	// Gutenberg Attributes
  blockProps: ReturnType<typeof useBlockProps | typeof useBlockProps.save>;
  setAttributes?: (data: any) => void;
}

const $$component$$ = ({
  blockProps,
  setAttributes,
}: $$component$$Props) => {
  return <div {...blockProps}>Hello World!</div>;
};

export default $$component$$;
