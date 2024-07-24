// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          buffer: require.resolve('buffer/'),
        };
      }
      return config;
    },
  };
  