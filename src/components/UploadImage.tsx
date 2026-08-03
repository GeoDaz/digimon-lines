import React from 'react';
import Icon from './Icon';
import { makeClassName } from '@/functions';

const UploadImage: React.FC<{
	handleUpload: CallableFunction;
	className?: string;
	id?: string;
	label?: string;
	disabled?: boolean;
}> = ({ handleUpload, className, id = 'upload-image', disabled = false }) => {
	const getBase64 = (file: File) => {
		return new Promise<string | null>((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () =>
				resolve(
					reader.result && typeof reader.result === 'object' ?
						reader.result.toString()
					:	reader.result
				);
			reader.onerror = error => reject(error);
		});
	};

	const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files?.length) {
			let file = files[0];
			if (
				file.type !== 'image/png' &&
				file.type !== 'image/jpeg' &&
				file.type !== 'image/webp' &&
				file.type !== 'image/gif'
			) {
				return;
			}
			getBase64(file).then(base64 => handleUpload(base64));
		}
	};

	return (
		<>
			<label
				htmlFor={id}
				className={makeClassName(
					'btn btn-secondary',
					disabled && 'disabled',
					className
				)}
			>
				<Icon name="upload" className="me-2" /> Upload an image
			</label>
			<input
				type="file"
				className="d-none"
				accept="image/jpeg,image/png,image/webp" //image/gif,
				id={id}
				name={id}
				onChange={handleFiles}
				disabled={disabled}
			/>
		</>
	);
};
export default UploadImage;
