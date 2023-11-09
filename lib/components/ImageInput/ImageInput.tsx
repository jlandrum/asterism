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
  label: string;
  value?: Media;
  useSlot?: string;
  useBlockControls?: boolean;
  className?: string;
  style?: CSSProperties;
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
    <div style={{ display: "inline-block" }} {...focusListener.props}>
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
 * Allows selecting an image.
 * @param label The label to display in the toolbar
 * @param value The current value of the image
 * @param className The class name to apply to the image
 * @param onChange A callback to trigger when the image is changed
 * @param useSlot A slot to render the toolbar in
 * @param useBlockControls Whether to use block controls instead of a slot fill or the built in toolbar
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
