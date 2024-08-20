import { getDirPaths } from '@/functions/file';
import { BuildProps, PageBuild } from '@/pages/build';
import Line from '@/types/Line';
import { GetServerSideProps } from 'next';

const PageBis = (props: BuildProps) => <PageBuild {...props} />;

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

export default PageBis;
