export function notifications(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/128.png',
    title: title,
    message: message,
  })
}

export function getLocal(key, fun) {
  chrome.storage.local.get(key, (res) => fun(res))
}

export function setLocal(obj) {
  chrome.storage.local.set(obj)
}

export function getSync(key, fun) {
  chrome.storage.sync.get(key, (res) => fun(res))
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
