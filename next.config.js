module.exports = {
  images: {
    domains: [
      "cloudflare-ipfs.com",
      "ipfs.io",
      "ipfs.blockfrost.dev",
      "skyharbor.mypinata.cloud",
      "skyharbor.mo.cloudinary.net",
      "skyharbor-storage.fra1.cdn.digitaloceanspaces.com",
      "skyharbor.imgix.net",
      "cdn.discordapp.com",
      "media.discordapp.net",
      "skyharbor-storage.fra1.digitaloceanspaces.com",
      "pbs.twimg.com",
      "i.ibb.co",
      "i.imgur.com",
    ],
    formats: ["image/avif", "image/webp"],
  },
  reactStrictMode: true,
  webpack(config) {
    const experiments = config.experiments || {};
    config.experiments = { ...experiments, asyncWebAssembly: true };
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";

    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false, // the solution
    };

    return config;
  },
  presets: ["next/babel"],
};
