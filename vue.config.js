const { resolve } = require('core-js/fn/promise');
const ExtensionReloader  = require('webpack-extension-reloader');

module.exports = {
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup'
    },
    background: {
      template: 'public/browser-extension.html',
      entry: './src/background/main.js',
      title: 'Background'
    }
  },
  pluginOptions: {
    browserExtension: {
      components: {
        background: true,
      },
      componentOptions: {
        background: {
          entry: './src/background/main.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ]
          }
        }
      },
    }
  },
  configureWebpack: {
    plugins: [
      new ExtensionReloader({
        port: 9091,
        reloadPage: true,
        entries: {
          background: 'background',
          extensionPage: ['popup'],
        }
      })
    ]
  },
  chainWebpack: config => {
    const svgRule = config.module.rule("svg");
    svgRule.uses.clear();
    svgRule
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
        include: ["./src/svg"]
      });
  }
}
