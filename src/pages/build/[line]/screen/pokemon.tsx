import Line from '@/types/Line';
import { GetServerSideProps } from 'next';
import PageScreenShot, { ScreenShotProps } from '.';

export const getServerSideProps: GetServerSideProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string) as Line;

		const props: ScreenShotProps = {
			zoom: 100,
			context: { key: 'pokemon', name: 'Pokémon' },
		};
		if (line) props.line = line;
		return { props };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageScreenShot;
