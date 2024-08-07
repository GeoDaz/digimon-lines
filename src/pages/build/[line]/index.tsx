import { getDirPaths } from '@/functions/file';
import { BuildProps, PageBuild } from '@/pages/build';
import Line from '@/types/Line';
import { GetStaticProps } from 'next';

const Page = (props: BuildProps) => <PageBuild {...props} />;

export const getServerSideProps: GetStaticProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string) as Line;
		const searchList = getDirPaths('images/digimon');

		const props: BuildProps = { searchList };
		if (line) props.line = line;
		return { props };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default Page;
