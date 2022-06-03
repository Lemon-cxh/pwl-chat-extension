const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const Icons = require('unplugin-icons/webpack')
const IconsResolver = require('unplugin-icons/resolver')
const ExtensionReloader = require('webpack-extension-reloader')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  // vue-cli-plugin-browser-extension 相关设置
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup',
    },
    devtools: {
      template: 'public/browser-extension.html',
      entry: './src/devtools/main.js',
      title: 'Devtools',
    },
  },
  pluginOptions: {
    browserExtension: {
      manifestSync: ['version'],
      components: {
        background: true,
        contentScripts: true,
      },
      componentOptions: {
        background: {
          entry: 'src/background.js',
        },
        contentScripts: {
          entries: {
            'content-script': ['src/content-scripts/content-script.js'],
          },
        },
      },
    },
  },
  productionSourceMap: isProduction ? false : true,
  css: {
    // 打包提示警告信息:warning Conflicting order
    // see https://github.com/vuejs/vue-cli/issues/3771#issuecomment-593360794
    extract: isProduction ? { ignoreOrder: true } : false,
  },
  configureWebpack: (config) => {
    // 自动导入Element Plus 以及 Element Icon
    config.plugins.push(
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconsResolver()],
      }),
      Icons()
    )
    if (isProduction) {
      // webpack-extension-reloader 热加载
      config.plugins.push(
        new ExtensionReloader({
          port: 9091,
        })
      )
    }
  },
  chainWebpack: (config) => {
    // 自定义的 Icon-svg 组件配置
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        include: ['./src/svg'],
      })
  },
}
