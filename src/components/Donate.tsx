import { DONATE_URL } from '@/consts/env';

const Donate = () => {
	return (
		<div className="donate">
			Support us on{' '}
			<a
				href={DONATE_URL}
				target="_blank"
				rel="noopener noreferrer nofollow"
				className="btn btn-outline-light"
			>
				Ko-Fi
			</a>{' '}
			— Digimon Lines is a non-profit fan-made project. Your donations help support
			hosting and maintenance costs to keep the site online.
		</div>
	);
};

export default Donate;
