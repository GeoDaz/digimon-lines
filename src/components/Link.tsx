import React, { forwardRef } from 'react';
import NextLink from 'next/link';

const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof NextLink>>(
	function Link({ prefetch = false, ...props }, ref) {
		return <NextLink ref={ref} prefetch={prefetch} {...props} />;
	}
);

export default Link;
