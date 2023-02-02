const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "production",
  entry: {
    background: path.resolve(__dirname, "..", "background.ts"),
    popup: path.resolve(__dirname, "..", "popup/popup.ts"),
    content: path.resolve(__dirname, "..", "scripts/content.ts"),
    storage: path.resolve(__dirname, "..", "storage.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".html", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/],
        loader: "html-loader",
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        loader: "css-loader",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }]
    }),
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "popup",
      globOptions: {
            ignore: [ // Ignore all `ts/js` files
              "**/*.ts",
              "**/*.js",
            ],
          },}]
    }),
  ],
};
