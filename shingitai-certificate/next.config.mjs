// import withMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
    // pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blue-decisive-scorpion-371.mypinata.cloud',
                pathname: '/ipfs/**',
            }
        ]
    }
};

export default nextConfig;
