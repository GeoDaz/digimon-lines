import React from 'react';
import Icon from './Icon';

const UploadImage: React.FC<{
	handleUpload: CallableFunction;
}> = ({ handleUpload }) => {
	const getBase64 = (file: File) => {
		return new Promise<string | null>((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () =>
				resolve(
					reader.result && typeof reader.result === 'object'
						? reader.result.toString()
						: reader.result
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
			<label htmlFor="upload-image" className="btn btn-secondary">
				<Icon name="upload" className="me-2" /> Upload an image
			</label>
			<input
				type="file"
				className="d-none"
				accept="image/jpeg,image/png" //image/gif,
				id="upload-image"
				name="upload-image"
				onChange={handleFiles}
			/>
		</>
	);
};
export default UploadImage;
