import React, {
	createElement,
	Fragment
} from "@wordpress/element";
import { NestedComponentsProps } from "./NestedComponents";

export const NestedSave = <T,>({
	element = 'div', className, value, children, ...remaining
}: NestedComponentsProps<T>) => {
    return createElement(
		element,
		{className, ...remaining },
        (value || []).map((v, i) => (
		<Fragment key={i}>
			{children({ value: v, index: i, update: () => { } })}
		</Fragment>
		))
		);
};
