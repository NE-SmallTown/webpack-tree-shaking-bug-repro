const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const resolveModuleName = function (moduleName) {
  const ns = moduleName.split('/');
  return ns.reduce(function (acc, curr, i) {
    curr = i === 0 || i === ns.length ? curr : "\\" + path.sep + curr;
    acc += curr;
    return acc;
  }, '');
};

const getBabelExclude = function () {
  const baseFilterREStr = "node_modules";
  const compileModules = [
    '@hyext/hy-ui',
    '@hyext-beyond/hy-ui-native',
    '@hyext-beyond/core',
    'react-router-native',
    'react-native-web'
  ];

  const output = compileModules.reduce(function (regexStr, moduleName) {
    const modulePath = resolveModuleName(moduleName);
    const modulePathUnit = "(?!\\" + path.sep + modulePath + ")";
    regexStr += modulePathUnit;
    return regexStr;
  }, baseFilterREStr);

  return new RegExp(output);
}

module.exports = {
  mode: 'production',

  entry: {
    index_web: path.resolve(__dirname, 'index_web.js')
  },

  resolve: {
    modules: ['node_modules'],
    alias: {
      '@hyext-beyond/core': path.resolve(__dirname, 'node_modules/@hyext-beyond/core/index.web.js')
    },
    extensions: ['.js']
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: 'https://test.com/'
  },

  optimization: {
    providedExports: true,
    usedExports: true,
    namedChunks: false,
    moduleIds: 'hashed',
    runtimeChunk: true,
    splitChunks: {
      chunks: 'async',
      minSize: 10000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 7,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        polyfill: {
          test: /[\\/]node_modules[\\/](core-js|raf|@babel|babel)[\\/]/,
          name: 'polyfill',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'initial',
          reuseExistingChunk: true,
          minChunks: 1,
          priority: 9
        },
        commons: {
          name: 'commons',
          minChunks: 2,
          priority: 8,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },

  module: {
    rules: [
      {
        enforce: 'post',
        test: /\.hycss$/,
        loader: 'hycss-loader',
        options: {
          designWidth: 750,
          enableVW: true
        }
      },
      {
        test: /\.(webp|gif|jpe?g|png|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]'
          }
        }
      },
      {
        enforce: 'pre',
        test: path.resolve(__dirname, 'index_web.js'),
        exclude: [/node_modules/],
        use: [
          {
            loader: '@hyext/hyext-entry-loader'
          }
        ]
      },
      {
        test: /\.(js|ts|tsx)$/,
        exclude: getBabelExclude(),
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: false,

              presets: [
                'module:metro-react-native-babel-preset',
                '@babel/preset-typescript'
              ],

              plugins: [
                'babel-plugin-syntax-dynamic-import',
                'babel-plugin-transform-jsx-to-hy-stylesheet',
                'babel-plugin-react-native-web',
                [
                  '@babel/plugin-transform-runtime',
                  {
                    corejs: 3,
                    helpers: true,
                    regenerator: true
                  }
                ]
              ]
            }
          }
        ]
      }
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(false),
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    new webpack.NamedModulesPlugin(),

    new HtmlWebpackPlugin({
      filename: 'bundle.html',
      template: path.resolve(__dirname, 'build.html'),
      chunks: ['polyfill', 'vendors', 'commons', "runtime~index_web", 'index_web'],
    })
  ]
}