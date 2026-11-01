import LineGrid from '@/components/Line/LineGrid';
import { getLicence, LicenseContext } from '@/context/license';
import { ZoomProvider } from '@/context/zoom';
import { Line } from '@/types/Line';

const LineShowcase = ({
	line,
	label,
	licence,
	zoom = 50,
}: {
	line: Line;
	label: string;
	licence?: string;
	zoom?: number;
}) => (
	<div className="home-mock" aria-hidden="true">
		<div className="home-mock-bar">
			<span />
			<span />
			<span />
			<span className="home-mock-label">{label}</span>
		</div>
		<div className="home-line-preview">
			<LicenseContext.Provider value={getLicence(licence)}>
				<ZoomProvider zoom={zoom}>
					<LineGrid line={line} />
				</ZoomProvider>
			</LicenseContext.Provider>
		</div>
	</div>
);

export default LineShowcase;
