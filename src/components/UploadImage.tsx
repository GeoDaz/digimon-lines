import React from 'react';
import Icon from './Icon';
import { makeClassName } from '@/functions';
import { useToast } from '@/context/toast';
import { UPLOAD_IMAGE_TYPES } from '@/consts/images';

/**
 * L'upload n'est pas limité en poids : les images uploadées sont les seules qui
 * fonctionnent avec l'export « Save as Image ». Elles sont retirées au moment
 * d'enregistrer dans le compte (voir stripUploadedImages), pas ici.
 */
const UploadImage: React.FC<{
	handleUpload: CallableFunction;
	className?: string;
	id?: string;
	label?: string;
	disabled?: boolean;
}> = ({ handleUpload, className, id = 'upload-image', disabled = false }) => {
	const { addToast } = useToast();

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
			// Le même fichier rechoisi après un refus doit relancer l'événement.
			e.target.value = '';
			if (!UPLOAD_IMAGE_TYPES.includes(file.type)) {
				addToast('Only PNG, JPEG, WebP and GIF images can be uploaded', 'danger');
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
