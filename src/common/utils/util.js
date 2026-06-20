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

function repair(s) {
  return s < 10 ? '0' + s : s
}

/**
 * 判断值是否为 null 或 undefined
 * @param {*} s
 * @returns {boolean}
 */
export function isNullOrUndefined(s) {
  return s === undefined || s === null
}

/**
 * 判断值是否为空（null / undefined / 空字符串）
 * @param {*} s
 * @returns {boolean}
 */
export function isEmpty(s) {
  return isNullOrUndefined(s) || s.length === 0
}
