/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;