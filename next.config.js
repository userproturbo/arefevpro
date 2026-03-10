/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["@prisma/client", "prisma", "heic-convert", "libheif-js"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.storage.yandexcloud.net" },
      { protocol: "https", hostname: "storage.yandexcloud.net" },
    ],
  },
};

module.exports = nextConfig;
