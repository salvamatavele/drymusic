import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb"],
  // build Docker: gera servidor standalone (mínimo e rápido)
  ...(process.env.BUILD_STANDALONE === "1" && { output: "standalone" as const }),
};

export default nextConfig;
