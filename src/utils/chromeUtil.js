export function notifications(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/128.png',
    title: title,
    message: message
  });
}

export function getLocal(key, fun) {
  chrome.storage.local.get(key, res => fun(res))
}

export function setLocal(obj) {
  chrome.storage.local.set(obj);
}