import React from 'react';
import Head from 'next/head';

const JsonLd: React.FC<{ data: object }> = ({ data }) => (
	<Head>
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
		/>
	</Head>
);

export default JsonLd;
