const fs = require('fs')
const webpack = require('webpack')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || '0.0.0'

module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          VUE_APP_VERSION: `"${version}"`
        }
      })
    ]
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "Worxstr";
        return args;
      })
  }
}