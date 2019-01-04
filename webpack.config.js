const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  entry: {
    app: './src/app.ts',
    worker: './src/worker.ts'
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};