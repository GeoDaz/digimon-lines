import LineGrid from '@/components/Line/LineGrid';
import { GetStaticProps } from 'next';

const Page: React.FC<{ ssr: Record<string, any> }> = ({ ssr }) => {
	const style = 'header{display: none}';
	return (
		<div className="page container-fluid">
			<style>{style}</style>
			<LineGrid line={ssr.line} zoom={ssr.zoom} />
		</div>
	);
};

export const getServerSideProps: GetStaticProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string);

		const ssr: Record<string, any> = { zoom: 100 };
		if (line) ssr.line = line;
		return { props: { ssr } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default Page;
