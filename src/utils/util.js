export function getDate() {
  const now = new Date()
  return (
    now.getFullYear() +
    '-' +
    repair(now.getMonth() + 1) +
    '-' +
    repair(now.getDate())
  )
}

export function getDateTime(str) {
  const now = str ? new Date(str) : new Date()
  if (str) {
    now.setTime(now.getTime() - 57600000)
  }
  return (
    now.getFullYear() +
    '-' +
    repair(now.getMonth() + 1) +
    '-' +
    repair(now.getDate()) +
    ' ' +
    repair(now.getHours()) +
    ':' +
    repair(now.getMinutes()) +
    ':' +
    repair(now.getSeconds())
  )
}

export function isRedPacket(message) {
  return (
    message.content && message.content.indexOf('msgType":"redPacket') !== -1
  )
}

export function getMessageMark() {
  const userAgent = window.navigator.userAgent
  return `\n<span class="${
    userAgent.indexOf('Edg') > -1 ? 'edge' : 'chrome'
  }-extension-message"/>`
}

function repair(s) {
  return s < 10 ? '0' + s : s
}
