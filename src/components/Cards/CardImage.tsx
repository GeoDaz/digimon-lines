import React, { useState } from 'react';

interface Props {
	src: string;
	name: string;
	code?: string;
	lazy?: boolean;
}

const CardImage: React.FC<Props> = ({ src, name, code, lazy = true }) => {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	if (failedSrc === src) {
		return (
			<span className="card-image-missing" role="img" aria-label={name}>
				<b>{name}</b>
				{code && <small>{code}</small>}
			</span>
		);
	}
	return (
		<img
			src={src}
			alt={name}
			loading={lazy ? 'lazy' : undefined}
			onError={() => setFailedSrc(src)}
		/>
	);
};

export default CardImage;
