import {
  useBlockProps,
} from "@wordpress/block-editor";

interface $$component$$Props {
	blockProps: ReturnType<typeof useBlockProps | typeof useBlockProps.save>;
	attributes: any;
	setAttributes?: (data: any) => void;
}

const $$component$$ = ({
	blockProps,
	attributes,
	setAttributes,
}: $$component$$Props) => {
	return (
		<div {...blockProps}>
			Hello World!
		</div>
	);
};

export default $$component$$