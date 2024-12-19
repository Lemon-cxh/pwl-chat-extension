const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const Icons = require('unplugin-icons/webpack')
const IconsResolver = require('unplugin-icons/resolver')
const webpack = require('webpack')
const webpackHotMiddleware = require('webpack-hot-middleware')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_NAME = require('./package.json').name
const isProduction = process.env.NODE_ENV === 'production'
// 定义项目根目录
const rootPath = path.resolve(__dirname)

module.exports = defineConfig({
  // 多入口页面配置：为Chrome扩展定义不同的入口
  pages: {
    // popup入口：点击扩展图标时弹出的页面
    popup: {
      // 入口文件位置
      entry: 'src/popup/main.js',
      // HTML模板
      template: 'public/browser-extension.html',
      // 输出的HTML文件名
      filename: 'popup.html'
    },
    // devtools入口：Chrome开发者工具中的页面
    devtools: {
      entry: 'src/devtools/main.js',
      template: 'public/browser-extension.html',
      filename: 'devtools.html'
    }
  },
  css: {
    // 打包提示警告信息: warning Conflicting order
    // see https://github.com/vuejs/vue-cli/issues/3771#issuecomment-593360794
    extract: isProduction ? { ignoreOrder: true } : false
  },
  configureWebpack: (config) => {
    // 使用不依赖 eval 的 source map
    config.devtool = 'cheap-source-map'
    config.entry = {
      ...config.entry,
      background: path.resolve('src/background/index.js'),
      'content-scripts': path.resolve(rootPath, 'src/content-scripts/index.js')
    }
    // 插件配置
    config.plugins.push(
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconsResolver()]
      }),
      Icons(),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve('src/manifest.json'),
            to: path.resolve(rootPath, 'dist/manifest.json'),
            transform: (content) => {
              // 将内容解析为对象
              const manifest = JSON.parse(content)
              // 更新 version 字段
              manifest.version = process.env.VUE_APP_VERSION
              // 返回更新后的内容
              return JSON.stringify(manifest, null, 2)
            }
          }
        ]
      })
    )
    // 如果是生产环境，添加 Terser 插件以压缩代码
    if (isProduction) {
      config.optimization = {
        minimize: true,
        minimizer: [new TerserPlugin()]
      }
    }
    if (!isProduction) {
      config.plugins.push(
        new ZipPlugin({
          path: path.resolve(rootPath, 'artifacts'),
          filename: `{process.env.VUE_APP_NAME}-{process.env.VUE_APP_VERSION}-{process.env.NODE_ENV}.zip`
        }),
        // 启用热模块替换
        new webpack.HotModuleReplacementPlugin()
      )
    }
  },
  chainWebpack: (config) => {
    // 设置 source-map
    config.devtool('source-map')
    // 自定义的 Icon-svg 组件配置
    config.module
      .rule('svg')
      .test(/\.svg$/)
      .exclude.add(/node_modules/)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        include: ['src/svg'],
      })
  },
  devServer: {
    before: (app, server) => {
      // 使用 webpack-dev-middleware
      app.use(
        webpackDevMiddleware(server.compiler, {
          publicPath: '/'
        })
      )

      // 使用 webpack-hot-middleware
      app.use(
        webpackHotMiddleware(server.compiler, {
          // 热重载的路径
          path: '/__webpack_hmr'
        })
      )
    },
    port: 9091,
    // 启用热重载
    hot: true
  },
  // 关闭生产环境source map
  // 原因：减小打包体积，保护源代码
  productionSourceMap: !isProduction,
  // 输出目录
  outputDir: path.resolve(rootPath, 'dist')
})
