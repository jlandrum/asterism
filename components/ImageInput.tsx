import { __ } from "@wordpress/i18n";
import { EditOnly, SaveOnly } from "./SwiftState";
import {
  InspectorControls,
  MediaPlaceholder,
  MediaUploadCheck,
  MediaUpload,
} from "@wordpress/block-editor";
import { Button, ButtonGroup } from "@wordpress/components";
import { chevronLeft, chevronRight, chevronUp, chevronDown, close, replace } from "@wordpress/icons";

import './ImageInput.scss';

export interface Media {
	id: number;
	url?: string;
	alt?: string;
}

interface ImageInputProps {
  label: string;
  value?: Media;
  className?: string;
  onChange: (value: Media) => void;
  removable?: boolean;
	movable?: false | 'horizontal' | 'vertical';
	onMove?: (direction: -1 | 1) => void;
	onRemove?: () => void;
}

const moveLabels = {
	'horizontal': ['Move Left', 'Move Right'],
	'vertical': ['Move Up', 'Move Down'],
}

const icons = {
	'horizontal': [chevronLeft, chevronRight],
	'vertical': [chevronUp, chevronDown],
}

const ImageInput = ({
  label = "Image",
  value,
  className,
  removable = false,
	movable = false,
  onChange,
	onMove,
	onRemove
}: ImageInputProps) => {
	return (
		<>
			<EditOnly>
				<div className="image-input">
					<MediaUploadCheck>
						<MediaUpload
							title={__("Image", "esa")}
							onSelect={(v) => onChange(v)}
							allowedTypes={["image"]}
							render={(props: any) =>
								value?.url ? (
									<img
										className={className}
										src={value?.url}
										alt={value?.alt}
										tabIndex={0}
										onClick={() => props.open()}
									/>
								) : (
									<div className={`${className||''} update-text`} onClick={() => props.open()}>
										{__(value ? `Update ${label}` : `Select ${label}`, "esa")}
									</div>
								)
							}
						/>
					</MediaUploadCheck>
					<ButtonGroup className="actions">
						{ movable && <Button onClick={() => onMove?.(-1)} label={moveLabels[movable][0]} icon={icons[movable][0]} /> }
						{ movable && <Button onClick={() => onMove?.(1)} label={moveLabels[movable][1]} icon={icons[movable][1]} /> }
						{ removable && <Button onClick={() => onRemove?.()} icon={close} label="Remove" />}
					</ButtonGroup>
				</div>
			</EditOnly>
			<SaveOnly>
				<img className={className} src={value?.url} alt={value?.alt} />
			</SaveOnly>
		</>
	);
};

export default ImageInput;
