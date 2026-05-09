/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      'unexerted-nonverifiable-jesenia.ngrok-free.dev',
      'i.pravatar.cc',
      'images.unsplash.com',
      'pub-dc64bbbe864b4f79b3fdd114bf9d76b3.r2.dev',
      'terence-gazeless-precomprehensively.ngrok-free.dev'
    ],
  },
}

module.exports = nextConfig

