import React, { forwardRef } from 'react';
import NextLink from 'next/link';

// Lien Next sans préchargement au scroll. Par défaut, chaque <Link> visible
// télécharge le JSON getStaticProps de sa page cible (/_next/data/...), non
// caché par le CDN : c'était la première source de bande passante Netlify.
// Le préchargement au survol reste actif, lui (comportement de Next).
// Passer prefetch explicitement pour réactiver le préchargement au cas par cas.
const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<typeof NextLink>>(
	function Link({ prefetch = false, ...props }, ref) {
		return <NextLink ref={ref} prefetch={prefetch} {...props} />;
	}
);

export default Link;
