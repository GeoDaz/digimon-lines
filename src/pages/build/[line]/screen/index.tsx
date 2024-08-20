import LineGrid from '@/components/Line/LineGrid';
import { defaultLicenceContext, LicenceProps, LicenseContext } from '@/context/license';
import Line from '@/types/Line';
import { GetServerSideProps } from 'next';

export interface ScreenShotProps {
	line?: Line;
	zoom?: number;
	context?: LicenceProps;
}

const PageScreenShot: React.FC<ScreenShotProps> = props => {
	if (!props.line) return <div>Line is missing</div>;
	return (
		<div className="page container-fluid">
			<style>{'header{display: none}'}</style>
			<LicenseContext.Provider value={props.context || defaultLicenceContext}>
				<LineGrid line={props.line} zoom={props.zoom} />
			</LicenseContext.Provider>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ query }: any) => {
	try {
		let line = query?.line;
		if (line) line = JSON.parse(line as string) as Line;

		const props: ScreenShotProps = { zoom: 100 };
		if (line) props.line = line;
		return { props };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageScreenShot;
