import React, { useState, useId, useRef, useEffect } from "@wordpress/element";

import { __ } from "@wordpress/i18n";
import { EditOnly, SaveOnly } from "../SwiftState/SwiftState";
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
	Tooltip
} from "@wordpress/components";
import {
	media,
} from "@wordpress/icons";

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
  onChange: (value: Media) => void;
}

const ImageInputEditor = ({
  label = "Image",
  value,
  className,
  useSlot,
	useBlockControls,
  onChange,
}: ImageInputProps) => {
  const [imagePopover, setImagePopover] = useState(false);
  const [toolbar, setToolbar] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<any>();
	const buttonRef = useRef<any>();

  const id = useId();
  const internalSlot = useSlot || `image-input-toolbar-${id}`;

	const ControlWrapper = useBlockControls ? BlockControls : Fill;
	
  return (
    <>
      <EditOnly>
				<img
					src={value?.url}
					alt={value?.alt}
					className={className}
					tabIndex={0}
					onFocus={() => setToolbar(true)}
					ref={ref}
				/>
      </EditOnly>
      <SaveOnly>
        <img src={value?.url} alt={value?.alt} className={className} />
      </SaveOnly>
      {!useSlot && toolbar && (
        <Popover
          anchor={ref.current}
          onClose={() => setToolbar(false)}
          placement="top-start"
          variant="unstyled"
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
            icon={media}
            onClick={props.open}
          />
        )}
      />
      <ControlWrapper controls="" name={internalSlot}>
        <div className="components-toolbar-group">
          <MediaUpload
            title={"Image"}
            onSelect={(v) => {
              onChange(v);
              setEditing(false);
            }}
            allowedTypes={["image"]}
            render={(props: any) => (
              <Button
	  						label={`Edit ${label}`}
                data-toolbar-item={true}
                className="components-toolbar-button"
                icon={media}
                onClick={() => buttonRef?.current?.click()}
              />
            )}
          />
        </div>
      </ControlWrapper>
    </>
  );
};

export const ImageInput = (props: ImageInputProps) => {
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
