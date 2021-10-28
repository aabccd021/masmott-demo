// NOTE: This file should not be edited
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  redirects: () => {
    return [
      {
        source: '/',
        destination: '/thread/new',
        permanent: false,
      },
    ]
  }
}
