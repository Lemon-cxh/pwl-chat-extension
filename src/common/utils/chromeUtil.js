import { STORAGE, defaultOptions } from '@/common/constant/Constant'

export function notifications(title, message) {
  /* global chrome */
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/128.png',
    title,
    message
  })
}

export function getLocal(key, fun) {
  return chrome.storage.local.get(key, (res) => fun && fun(res))
}

export function setLocal(obj) {
  chrome.storage.local.set(obj)
}

export function getSync(key, fun) {
  return chrome.storage.sync.get(key, (res) => fun && fun(res))
}

export function setSync(obj) {
  chrome.storage.sync.set(obj)
}

export function sendTabsMessage(message, callback) {
  chrome.tabs.query(
    { active: true, currentWindow: true, status: 'complete' },
    function (tabs) {
      if (tabs.length === 0) {
        callback && callback()
        return
      }
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        callback && callback(response)
      })
    }
  )
}

/**
 * 获取配置
 * @returns options
 */
export function getOptions() {
  return new Promise((resolve) => {
    getSync({ [STORAGE.options]: defaultOptions }, (result) => {
      resolve(result.options)
    })
  })
}

/**
 * 格式配置
 * @param {*} options 配置
 * @returns options
 */
export function formatOptions(options) {
  if (options.blacklist) {
    options.blacklist = JSON.parse(options.blacklist)
  }
  if (options.care) {
    options.care = JSON.parse(options.care)
  }
  return options
}
