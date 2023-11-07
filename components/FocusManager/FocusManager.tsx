import {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "@wordpress/element";



/**
 * Watches for clicks outside of a target element. Follows the React 
 * tree, allowing for nested click detectors to work across portals.
 * @param ref The target element to watch for touch events
 * @param onOuterClick A callback to trigger on outer click events
 * @param onInnerClick A callback to trigger on inner click events
 * @returns An object with the onMouseDownCapture and onTouchStartCapture 
 *          handlers that should be applied to the target element.
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

export const CaptureFocus = ({ onBlur, onFocus, children, ...props }: any) => {
	const focusManager = useFocusManager(onBlur, onFocus);

	return (
		<div {...focusManager.props} {...props}>
			{children}
		</div>
	)
}