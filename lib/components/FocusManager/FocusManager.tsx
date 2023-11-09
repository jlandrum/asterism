import {
  useRef,
  useState,
} from "@wordpress/element";

/**
 * Watches for clicks outside of a target element. Follows the React 
 * tree, allowing for nested click detectors to work across portals.
 * 
 * To use, create an instance of the hook with the callback functions,
 * then on the target element use {...hookInstance.props}.
 * 
 * @param ref The target element to watch for touch events
 * @returns An object containing the ref and props to apply to the target element.
 */
export const useFocusManager = (
  onOuterClick: () => void = () => {},
  onInnerClick: () => void = () => {},
	deps: any[] = [],
) => {
	const [ref, setRef] = useState<any>(undefined);
	
	const focused = useRef<boolean>(false);
	const delay = useRef<any>(-1);

	const focusIn = (event: any) => {
		if (!ref) return;
		clearTimeout(delay.current);
		focused.current = true;
		onInnerClick();
	};

	const focusOut = (event: any) => {
		if (!ref) return;
		
		delay.current = setTimeout(() => {
			if (focused.current) {
				focused.current = false;
				onOuterClick();
			}
		}, 5);
	};

	return {
		ref,
		props: {
			ref: setRef,
			onFocusCapture: focusIn,
			onBlurCapture: focusOut,
		}
	}
};

/**
 * A component that captures focus events and calls the provided callbacks.
 * 
 * For more details, see {@link useFocusManager}.
 * @returns ReactComponent - The component to render
 */
export const CaptureFocus = ({ onBlur, onFocus, children, element, ...props }: any) => {
	const focusManager = useFocusManager(onBlur, onFocus);
	const Element = element || 'div';

	return (
    <Element {...focusManager.props} {...props}>
      {children}
    </Element>
  );
}