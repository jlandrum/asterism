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
export const useClickDetector = (
  onOuterClick: () => void = () => {},
  onInnerClick: () => void = () => {},
	deps: any[] = [],
) => {
	const [ref, setRef] = useState<any>(undefined);
  const innerClick = useRef<boolean>(false);
	const setInnerClick = () => { innerClick.current = true };
	// @ts-ignore
	const editor = useMemo(() => document.querySelector('[name=editor-canvas]')?.contentDocument);
	
	const outerClickCallback = useCallback(onOuterClick, [ref, ...deps, onOuterClick]);
	const innerClickCallback = useCallback(onInnerClick, [ref, ...deps, onInnerClick]);

  useEffect(() => {
    const handleDocumentBlur = (event: any) => {
      const { target: blurredElement } = event;
      if (!ref?.contains?.(blurredElement) && !innerClick.current) {
        outerClickCallback?.();
      } else {
				innerClickCallback?.(); 
      }
      innerClick.current = false;
    };

    document.addEventListener("mousedown", handleDocumentBlur);
    document.addEventListener("touchstart", handleDocumentBlur);
    editor?.addEventListener("mousedown", handleDocumentBlur);
    editor?.addEventListener("touchstart", handleDocumentBlur);
    return () => {
      document.removeEventListener("mousedown", handleDocumentBlur);
      document.removeEventListener("touchstart", handleDocumentBlur);
      editor?.addEventListener("mousedown", handleDocumentBlur);
      editor?.addEventListener("touchstart", handleDocumentBlur);
    };
  }, [ref]);

	return {
		ref,
		props: {
			ref: setRef,
			onMouseDownCapture: setInnerClick,
			onTouchStartCapture: setInnerClick,
		}
	}
};
