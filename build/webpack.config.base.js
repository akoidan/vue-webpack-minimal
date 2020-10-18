const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const {execSync} = require('child_process');
const {getConfig} = require('./utils');
const ProgressPlugin = require("webpack/lib/ProgressPlugin");


module.exports = {
  context: __dirname,
  // cypress doesn't support fetch api, replace it with whatwg-fetch polyfill
  entry: [...(getConfig('APP_TEST') ? ['whatwg-fetch', '../src/assets/sass/test.sass'] : []), 'reflect-metadata', '../src/main.ts'],
  plugins: [
    new VuetifyLoaderPlugin(),
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        vue: true,
        tslint: false,
        configFile: '../tsconfig.json'
      }
    }),
    new ProgressPlugin(function (percentage, msg, current, active, modulepath) {
      if (process.stdout.isTTY && percentage < 1) {
        process.stdout.cursorTo(0);
        modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - process.stdout.columns + 45) : '';
        current = current ? ' ' + current : '';
        active = active ? ' ' + active : '';
        process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ');
        process.stdout.clearLine(1)
      } else if (percentage === 1) {
        process.stdout.cursorTo(0);
        process.stdout.clearLine(1)
      }
    })
  ],
  resolve: {
    extensions: ['.ts', '.vue', '.json', ".js", '.png', ".sass"],
    alias: {
      '@': path.join(__dirname, '..', 'src')
    }
  },
  output: {
    crossOriginLoading: 'anonymous',
    publicPath: getConfig('APP_PUBLIC_PATH')
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 2048000
  },
  devtool: '#source-map',
  devServer: {
    historyApiFallback: true
  },
  // optimization: {minimize: true},
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [['babel-preset-typescript-vue', { onlyRemoveTypeImports: true}]],
            plugins: [
              "@babel/plugin-proposal-optional-chaining",
              "@babel/plugin-proposal-numeric-separator",
              "@babel/plugin-proposal-nullish-coalescing-operator",
              ["@babel/plugin-proposal-decorators", {"legacy": true}],
              ["@babel/plugin-proposal-class-properties", {"loose": true}],
              ...(getConfig('APP_TEST') ? ['istanbul'] : []),
            ],
            babelrc: false,
          },
        }],
      },
      {
        exclude: /node_modules/,
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
};
