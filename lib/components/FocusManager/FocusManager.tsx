import {
  useRef,
  useState,
	useEffect
} from "@wordpress/element";

/**
 * Watches for clicks outside of a target element. Follows the React 
 * tree, allowing for nested click detectors to work across portals.
 * 
 * To use, create an instance of the hook with the callback functions,
 * then on the target element use {...hookInstance.props}.
 * 
 * @param onOuterClick The callback to fire when a click is detected outside of the target element
 * @param onInnerClick The callback to fire when a click is detected inside of the target element
 * @param deps The dependencies to watch for changes
 * @param watchBlock If true, the focus listener will follow the block instead of itself.
 * @returns An object containing the ref and props to apply to the target element.
 */
export function useFocusManager(
  onOuterClick: () => void = () => {},
  onInnerClick: () => void = () => {},
	deps: any[] = [],
	watchBlock: boolean = false,
) {
	const [ref, setRef] = useState<any>(undefined);

	const focused = useRef<boolean>(false);
	const delay = useRef<any>(-1);

	useEffect(() => {
    if (!ref || !watchBlock) return;
    let currentElement = ref;
	  let mutationObserver: MutationObserver | undefined = undefined;

    while (currentElement !== null) {
      if (currentElement.getAttribute("data-block")) {
        break;
      }
      currentElement = currentElement.parentElement;
    }

		if (currentElement && currentElement !== ref) {
			const mutationObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === "attributes" && mutation.attributeName === "class") {
						if (mutation.target.classList.contains("is-selected")) {
							focusIn?.(mutation);
						}
						else {
							focusOut?.(mutation);
						}
					}
				});
			});
			mutationObserver.observe(currentElement, { attributes: true });
		}

    return () => {
			mutationObserver?.disconnect();
    };
  }, [...deps, watchBlock, ref]);

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
      onFocusCapture: watchBlock ? undefined : focusIn,
      onBlurCapture: watchBlock ? undefined : focusOut,
    },
  };
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