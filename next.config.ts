import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Permite abrir el servidor de desarrollo desde un móvil en la red local
  // (http://192.168.x.x:8080). Sin esto Next bloquea los recursos de dev y la
  // página no se hidrata. Solo afecta a `next dev`.
  allowedDevOrigins: ["192.168.*.*"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
