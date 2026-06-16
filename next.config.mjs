/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Include NB-specific PDF templates in the serverless function bundle
    // so fs.readFileSync works on Vercel for document generation.
    outputFileTracingIncludes: {
      '/api/netzanmeldung/document': ['./nb-templates/**/*'],
    },
  },
};

export default nextConfig;
