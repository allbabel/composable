/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");
const withTM = require("next-transpile-modules")([
  "@integrations-lib/core",
  "substrate-react",
  "@web3-react/core",
  "shared",
  "tokens",
]);

function getVersion() {
  const date = new Date();

  return (
    "v" +
    date.getUTCFullYear().toString() +
    (date.getUTCMonth() + 1).toString().padStart(2, "0") +
    date.getUTCDay().toString().padStart(2, "0") +
    date.getUTCHours().toString().padStart(2, "0") +
    date.getUTCMinutes().toString().padStart(2, "0")
  );
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    SUBSTRATE_PROVIDER_URL_KUSAMA_2019:
      process.env.SUBSTRATE_PROVIDER_URL_KUSAMA_2019,
    SUBSTRATE_PROVIDER_URL_KUSAMA: process.env.SUBSTRATE_PROVIDER_URL_KUSAMA,
    RPC_URL_1: process.env.RPC_URL_1,
    RPC_URL_42161: process.env.RPC_URL_42161,
    RPC_URL_137: process.env.RPC_URL_137,
    RPC_URL_43114: process.env.RPC_URL_43114,
    RPC_URL_1285: process.env.RPC_URL_1285,
    RPC_URL_250: process.env.RPC_URL_250,
    SUBSQUID_URL: process.env.SUBSQUID_URL,
    WEBSITE_VERSION: getVersion(),
  },
  pwa: {
    dest: "public",
    skipWaiting: true, // Turn this to false once you're ready to deploy a banner to develop update prompt.
    mode: process.env.NODE_ENV === "production" ? "production" : "development", // This will create worker-box production build.
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = withPWA(withTM(nextConfig));
