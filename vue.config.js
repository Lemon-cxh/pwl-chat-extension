const ExtensionReloader  = require('webpack-extension-reloader');

module.exports = {
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup'
    },
    options: {
      template: 'public/browser-extension.html',
      entry: './src/options/main.js',
      title: 'Options'
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
          extensionPage: ['popup', 'options'],
        }
      })
    ]
  }
}
