import { getDirPaths } from '@/functions/file';
import PageBuild from '@/pages/build';
import { GetStaticProps } from 'next';

export const getServerSideProps: GetStaticProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string);
		const searchList = getDirPaths('images/digimon');

		const ssr: Record<string, any> = { searchList };
		if (line) ssr.line = line;
		return { props: { ssr } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageBuild;
