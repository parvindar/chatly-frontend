const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

let envVars = {};

// Load from .env if it exists
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const fileEnv = dotenv.parse(fs.readFileSync(envPath));
  envVars = fileEnv;
} else {
  console.warn('.env file not found — using process.env fallback');
  envVars = process.env;
}

// Format for DefinePlugin
const defineEnv = Object.keys(envVars).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(envVars[key]);
  return acc;
}, {});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }] // 👈 This is key
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|ico|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin(defineEnv),
    new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      publicPath: '/',
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      }),
    new CopyPlugin({
      patterns: [
        { from: 'public/icons', to: 'icons' },
        { from: 'public/manifest.json', to: 'manifest.json' },
      ],
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 👈 removes all console.* calls
          },
        },
      }),
    ],
  },
};
