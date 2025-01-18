const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const Icons = require('unplugin-icons/webpack')
const IconsResolver = require('unplugin-icons/resolver')
const webpack = require('webpack')
const webpackHotMiddleware = require('webpack-hot-middleware')
const path = require('path')
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
      background: path.resolve(rootPath, 'src/background/index.js'),
      'content-scripts': path.resolve(rootPath, 'src/content-scripts/index.js')
    }
    // 禁用代码分割
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        cacheGroups: {
          default: false
        }
      },
      runtimeChunk: false
    }
    // 插件配置
    config.plugins.push(
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconsResolver()],
        dirs: [path.resolve(rootPath, 'src/popup/components')], // 指定自定义组件的目录
        extensions: ['vue'], // 文件扩展名
        deep: true, // 是否递归扫描子目录
        dts: true // 生成类型声明文件
      }),
      Icons(),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(rootPath, 'src/manifest.json'),
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
    // 添加 resolve.alias 配置
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src')
      }
    }
    // 如果是生产环境，添加 Terser 插件以压缩代码
    if (isProduction) {
      // config.optimization = {
      //   minimize: true,
      //   minimizer: [new TerserPlugin()]
      // }
      config.plugins.push(
        new ZipPlugin({
          path: path.resolve(rootPath, 'artifacts'),
          filename: `${process.env.VUE_APP_NAME}-${process.env.VUE_APP_VERSION}-${process.env.NODE_ENV}.zip`
        })
      )
    } else {
      config.plugins.push(
        // 启用热模块替换
        new webpack.HotModuleReplacementPlugin()
      )
    }
  },
  chainWebpack: (config) => {
    // 配置 svg-sprite-loader
    config.module.rule('svg').exclude.add(path.resolve('src/popup/svg')).end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(path.resolve('src/popup/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        debug: true,
        runtimeCompat: true
      })
      .end()
    if (isProduction) {
      // 修改输出文件名
      config.output.filename('js/[name].js')
      config.output.chunkFilename('js/[name].js')

      // 添加 TerserPlugin 压缩
      config.optimization.minimize(true)
      config.optimization.minimizer('terser').use(TerserPlugin, [
        {
          terserOptions: {
            compress: {
              // 移除 console.log
              drop_console: true
            }
          }
        }
      ])
    }
  },
  devServer: {
    before: (app, server) => {
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
  // 禁用生产环境的 source map
  productionSourceMap: false,
  // 输出目录
  outputDir: path.resolve(rootPath, 'dist')
})
