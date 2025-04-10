const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          buffer: require.resolve("buffer/"),
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          assert: require.resolve("assert/"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          os: require.resolve("os-browserify/browser"),
          url: require.resolve("url/"),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ],
    },
  },
};
