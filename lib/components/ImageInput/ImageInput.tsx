import React, { useState, useId, useRef, useEffect } from "@wordpress/element";
import { CSSProperties } from "react";

import { __ } from "@wordpress/i18n";
import { EditOnly, SaveOnly } from "../RenderScope/RenderScope";
import {
	BlockControls,
  MediaUpload,
} from "@wordpress/block-editor";
import {
  Button,
  Fill,
  Slot,
  Toolbar,
  Popover,
  ToolbarButton,
	ToolbarGroup,
} from "@wordpress/components";
import {
	media, chevronDown
} from "@wordpress/icons";
import { useFocusManager } from "../FocusManager/FocusManager";

export interface Media {
  id: number;
  url?: string;
  alt?: string;
}

interface ImageInputProps {

	/** Label for the image input. */
  label: string;

	/** The current value of the image input. */
  value?: Media;

  /** If provided, the image select button will appear in the given slot.
	 *  Otherwise, the icon will appear centered and on top of the image input */	
  useSlot?: string;

	/** If true, the image select button will appear in the block controls.*/
  useBlockControls?: boolean;

	/** The class name to apply to the image. */
  className?: string;

	/** The style to apply to the image. */
  style?: CSSProperties;

	/** The callback to fire when the image is changed. */
  onChange: (value: Media) => void;
}

const ImageInputEditor = ({
  label = "Image",
  value,
  className,
	style,
  useSlot,
	useBlockControls,
  onChange,
}: ImageInputProps) => {
  const [showToolbar, setShowToolbar] = useState(false);
	const buttonRef = useRef<any>();

  const id = useId();
  const internalSlot = useSlot || `image-input-toolbar-${id}`;

	const ControlWrapper = useBlockControls ? BlockControls : Fill;
	const focusListener = useFocusManager(
    () => setShowToolbar(false),
    () => setShowToolbar(true)
  );

  return (
    <div style={{ display: "contents" }} {...focusListener.props}>
      <img
        src={value?.url}
        alt={value?.alt}
        className={className}
        tabIndex={0}
        style={style}
      />
      {!useSlot && showToolbar && (
        // @ts-ignore
        <Popover
				// @ts-ignore
          placement="top-center"
          variant="unstyled"
          inline
          focusOnMount={false}
        >
          <Toolbar label="Image Input">
            <Slot name={internalSlot}></Slot>
          </Toolbar>
        </Popover>
      )}
      <MediaUpload
        title={"Image"}
        onSelect={onChange}
        allowedTypes={["image"]}
        render={(props: any) => (
          <Button
            ref={buttonRef}
            style={{ display: "none" }}
            icon={chevronDown}
            onClick={props.open}
          />
        )}
      />
      <ControlWrapper controls="" name={internalSlot}>
        <ToolbarGroup>
          <ToolbarButton
            label={`Edit ${label}`}
            data-toolbar-item={true}
            className="components-toolbar-button"
            icon={media}
            onClick={() => {
              buttonRef?.current?.click();
            }}
          />
        </ToolbarGroup>
      </ControlWrapper>
    </div>
  );
};

/**
 * A component that represents a selectable image.
 * @since 0.5.0
 */
export const ImageInput = (props: ImageInputProps) => {
  const { label = "Image", value, className, style, useSlot, onChange } = props;
  return (
    <>
      <EditOnly>
        <ImageInputEditor {...props} />
      </EditOnly>
      <SaveOnly>
        <img className={className} src={value?.url} alt={value?.alt} style={style} />
      </SaveOnly>
    </>
  );
};

export default ImageInput;
