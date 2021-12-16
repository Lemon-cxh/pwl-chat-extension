export function closeSocket() {
  chrome.extension.getBackgroundPage().closeSocket()
  chrome.storage.local.set({ key: '' })
}