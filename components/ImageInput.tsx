import React, { useState, useId, useRef } from "@wordpress/element";

import { __ } from "@wordpress/i18n";
import { EditOnly, SaveOnly } from "./SwiftState";
import {
  InspectorControls,
  MediaPlaceholder,
  MediaUploadCheck,
  MediaUpload,
} from "@wordpress/block-editor";
import {
  Button,
  ButtonGroup,
  Fill,
  Slot,
  Toolbar,
  ToolbarGroup,
  Popover,
  ToolbarButton,
} from "@wordpress/components";
import {
  chevronLeft,
  chevronRight,
  chevronUp,
  chevronDown,
  close,
  replace,
	media,
	Icon
} from "@wordpress/icons";

import "./ImageInput.scss";

export interface Media {
  id: number;
  url?: string;
  alt?: string;
}

interface ImageInputProps {
  label: string;
  value?: Media;
  useSlot?: string;
  className?: string;
  onChange: (value: Media) => void;
}

const ImageInputEditor = ({
  label = "Image",
  value,
  className,
  useSlot,
  onChange,
}: ImageInputProps) => {
  const [imagePopover, setImagePopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<any>();
	const buttonRef = useRef<any>();

  const id = useId();
  const internalSlot = useSlot || `image-input-toolbar-${id}`;

  return (
    <>
      <div className="image-input" onFocus={() => setToolbar(true)} ref={ref}>
        <button className="image-input__image">
          <img src={value?.url} alt={value?.alt} className={className} />
        </button>
      </div>
      {!useSlot && toolbar && (
        <Popover anchor={ref.current} onClose={() => setToolbar(false)}>
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
          <Button ref={buttonRef} style={{display: 'none'}} icon={media} onClick={props.open} />
        )}
      />
      <Fill name={internalSlot}>
        <ToolbarGroup>
          {/* <MediaUploadCheck> */}
          <MediaUpload
            title={"Image"}
            onSelect={(v) => {
              onChange(v);
              setEditing(false);
            }}
            allowedTypes={["image"]}
            render={(props: any) => <Button icon={media} onClick={() => buttonRef?.current?.click()} />}
          />
          {/* </MediaUploadCheck> */}
        </ToolbarGroup>
      </Fill>
    </>
  );
};

const ImageInput = (props: ImageInputProps) => {
  const { label = "Image", value, className, useSlot, onChange } = props;
  return (
    <>
      <EditOnly>
        <ImageInputEditor {...props} />
      </EditOnly>
      <SaveOnly>
        <img className={className} src={value?.url} alt={value?.alt} />
      </SaveOnly>
    </>
  );
};

export default ImageInput;
