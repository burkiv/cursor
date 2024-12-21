/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nextui-org/react"],
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 