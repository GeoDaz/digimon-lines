import Link from 'next/link';
import { useRouter } from 'next/router';

interface AnchorLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	hash: string;
	children: React.ReactNode;
}
const AnchorLink = ({ hash, children, ...props }: AnchorLinkProps) => {
	const router = useRouter();

	const onClick = (e: any) => {
		e.preventDefault();

		router
			.replace(
				// or push or whatever you want
				{
					pathname: window.location.pathname,
					hash,
					query: window.location.search,
				},
				undefined,
				{
					shallow: true,
				}
			)
			.catch(e => {
				// workaround for https://github.com/vercel/next.js/issues/37362
				if (!e.cancelled) {
					throw e;
				}
			});
	};

	return (
		<Link href={`#${hash}`} onClick={onClick} {...props}>
			{children}
		</Link>
	);
};
export default AnchorLink;
