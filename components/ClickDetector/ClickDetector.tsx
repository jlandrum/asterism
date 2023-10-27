import { useRef, useEffect } from "@wordpress/element";
import { SaveOnly, EditOnly } from "../SwiftState/SwiftState";

interface ClickDetectorProps {
  onOuterClick?: () => void;
  onInnerClick?: () => void;
	target: React.MutableRefObject<HTMLElement>;
  children: any;
}

export const ClickDetector = ({
  onOuterClick,
  onInnerClick,
	target,
  children,
}: ClickDetectorProps) => {
  const ref = useRef<any>();
  const innerClick = useRef<boolean>(false);

  useEffect(() => {
    const handleDocumentBlur = (event: any) => {
      const { target: blurredElement } = event;
      if (!ref.current?.contains?.(blurredElement) && !innerClick.current) {
        onOuterClick?.();
      } else {
        onInnerClick?.();
      }
      innerClick.current = false;
    };

    document.addEventListener("mousedown", handleDocumentBlur);
    document.addEventListener("touchstart", handleDocumentBlur);
    return () => {
      document.removeEventListener("mousedown", handleDocumentBlur);
      document.removeEventListener("touchstart", handleDocumentBlur);
    };
  }, []);

  return (
    <>
      <SaveOnly>{children}</SaveOnly>
      <EditOnly>
        <div
          ref={ref}
          onMouseDownCapture={() => (innerClick.current = true)}
          onTouchStartCapture={() => (innerClick.current = true)}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      </EditOnly>
    </>
  );
};

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
  onOuterClick?: () => void,
  onInnerClick?: () => void
) => {
	const ref = useRef<any>();
  const innerClick = useRef<boolean>(false);
	const setInnerClick = () => { innerClick.current = true; console.error('hit') };
	const editor = document.querySelector('[name=editor-canvas]')?.contentDocument;

  useEffect(() => {
    const handleDocumentBlur = (event: any) => {
      const { target: blurredElement} = event;
      if (!ref.current?.contains?.(blurredElement) && !innerClick.current) {
        onOuterClick?.();
      } else {
        onInnerClick?.();
      }
      innerClick.current = false;
    };

		console.error(document);

    document.addEventListener("mousedown", handleDocumentBlur);
    document.addEventListener("touchstart", handleDocumentBlur);
		editor?.addEventListener("mousedown", handleDocumentBlur);
    editor?.addEventListener("touchstart", handleDocumentBlur);
		console.error('MOUNTED');
    return () => {
			console.error('UNMOUNTED');
      document.removeEventListener("mousedown", handleDocumentBlur);
      document.removeEventListener("touchstart", handleDocumentBlur);
			document?.addEventListener("mousedown", handleDocumentBlur);
			document?.addEventListener("touchstart", handleDocumentBlur);
    };
  }, []);

	return {
		ref,
		onMouseDownCapture: setInnerClick,
		onTouchStartCapture: setInnerClick,
	}
};
