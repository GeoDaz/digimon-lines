import { getDirPaths } from '@/functions/file';
import { PageBuild, BuildProps } from '@/pages/build';
import Line from '@/types/Line';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string) as Line;
		const searchList = getDirPaths('images/digimon');

		const props: BuildProps = { searchList, noStorage: true };
		if (line) props.line = line;
		return { props };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageBuild;
