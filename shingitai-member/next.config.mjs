/** @type {import('next').NextConfig} */
const nextConfig = {
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
