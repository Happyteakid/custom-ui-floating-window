/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    responseLimit: false,
  },
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.GITPOD_WORKSPACE_URL
  }
};

module.exports = nextConfig;
