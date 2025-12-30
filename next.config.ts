import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */

	cacheComponents: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
		],
	},

	async rewrites() {
		return [
			{
				source: '/ingest/static/:path*',
				destination: 'https://us-assets.i.posthog.com/static/:path*',
			},
			{
				source: '/ingest/:path*',
				destination: 'https://us-assets.i.posthog.com/:path*',
			},
		];
	},
	// This is required to support posthog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
