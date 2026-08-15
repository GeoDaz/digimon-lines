import React from 'react';
import { useRouter } from 'next/router';
import ProfileLines from '@/components/Account/ProfileLines';

const PageProfile = () => {
	const { pseudo } = useRouter().query as { pseudo?: string };
	return <ProfileLines pseudo={pseudo} />;
};

export default PageProfile;
