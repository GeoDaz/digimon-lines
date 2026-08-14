import Link from 'next/link';

const Footer = () => {
	return (
		<footer className="footer">
			Digimon Lines is not affiliated with, sponsored, endorsed, or approved by
			Bandai Co., Ltd., Toei Animation, or any of their subsidiaries or affiliates.
			<br />
			Digimon, Digital Monsters, and all related names, characters, and images are
			trademarks or registered trademarks of Bandai Co., Ltd. © Bandai.
			<br />
			<Link href="/privacy">Privacy Policy</Link>
			{' · '}
			<Link href="/terms">Terms of Service</Link>
		</footer>
	);
};

export default Footer;
