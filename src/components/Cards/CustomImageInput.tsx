import React from 'react';
import InputMono from '@/components/InputMono';
import UploadImage from '@/components/UploadImage';
import { useToast } from '@/context/toast';

interface Props {
	id: string;
	placeholder: string;
	maxWidth: number;
	maxHeight: number;
	onSelect: (src: string) => void;
	className?: string;
}

const shrinkImage = (src: string, maxWidth: number, maxHeight: number) =>
	new Promise<string>((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
			const canvas = document.createElement('canvas');
			canvas.width = Math.round(image.naturalWidth * scale);
			canvas.height = Math.round(image.naturalHeight * scale);
			const ctx = canvas.getContext('2d');
			if (!ctx) return reject(new Error('Canvas unavailable'));
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL('image/webp', 0.9));
		};
		image.onerror = reject;
		image.src = src;
	});

const isHttpUrl = (value: string) => {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
};

const CustomImageInput: React.FC<Props> = ({
	id,
	placeholder,
	maxWidth,
	maxHeight,
	onSelect,
	className,
}) => {
	const { addToast } = useToast();

	const handleUrl = (_name: string, value?: string) => {
		const url = value?.trim() || '';
		if (!isHttpUrl(url)) {
			addToast('Enter an http(s) image URL', 'danger');
			return;
		}
		onSelect(url);
	};

	const handleUpload = (base64: string | null) => {
		if (!base64) return;
		shrinkImage(base64, maxWidth, maxHeight)
			.then(onSelect)
			.catch(() => addToast('This image could not be read', 'danger'));
	};

	return (
		<div className={className ? `card-picker-custom ${className}` : 'card-picker-custom'}>
			<InputMono
				name={`${id}-url`}
				onSubmit={handleUrl}
				placeholder={placeholder}
				className="flex-grow-1"
				variant="outline-primary"
			/>
			<UploadImage handleUpload={handleUpload} id={`${id}-upload`} className="mb-3" />
		</div>
	);
};

export default CustomImageInput;
