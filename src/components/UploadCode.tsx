import React from 'react';
import Icon from './Icon';

const UploadCode: React.FC<{
	handleUpload: CallableFunction;
}> = ({ handleUpload }) => {
	const getContent = (file: File) => {
		return new Promise<string | null>((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsText(file);
			reader.onload = () =>
				resolve(
					reader.result &&
						JSON.parse(
							typeof reader.result === 'object'
								? reader.result.toString()
								: reader.result
						)
				);
			reader.onerror = error => reject(error);
		});
	};

	const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files?.length) {
			let file = files[0];
			if (file.type !== 'application/json') return;
			getContent(file).then(json => handleUpload(file.name.split('.')[0], json));
		}
	};

	return (
		<>
			<label htmlFor="upload-code" className="btn btn-secondary">
				<Icon name="upload" className="me-2" /> Import from{' '}
				<Icon name="braces ms-1" />
			</label>
			<input
				type="file"
				className="d-none"
				accept="application/json"
				id="upload-code"
				name="upload-code"
				onChange={handleFiles}
			/>
		</>
	);
};
export default UploadCode;
