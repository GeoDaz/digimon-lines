import Icon from '@/components/Icon';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

export default function Page404() {
	const router = useRouter();

	return (
		<Layout title="Page not found" metatitle="Error 404">
			<Button variant="primary" onClick={() => router.push('/')}>
				<Icon name="home" /> Go back to Home
			</Button>
		</Layout>
	);
}
