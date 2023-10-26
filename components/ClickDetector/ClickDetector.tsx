import { useRef,useEffect } from "@wordpress/element";
import { SaveOnly, EditOnly } from "../SwiftState/SwiftState";

interface ClickDetectorProps {
	onOuterClick?: () => void;
	onInnerClick?: () => void;
	children: any;
}

export const ClickDetector = ({
	onOuterClick,
	onInnerClick,
	children,
}: ClickDetectorProps) => {
	const ref = useRef<any>();
	const innerClick = useRef<boolean>(false);

	useEffect(() => {
		const handleDocumentBlur = (event: any) => {
			const { target: blurredElement, currentTarget: documentElement } =
				event;
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
      <SaveOnly>
				{children}
			</SaveOnly>
			<EditOnly>
				<div ref={ref} onMouseDownCapture={() => innerClick.current = true}
                			 onTouchStartCapture={() => innerClick.current = true}
						 style={{display: 'contents'}}>
					{children}
				</div>
			</EditOnly>
    </>
  );
}