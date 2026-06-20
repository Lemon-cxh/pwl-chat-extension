/**
 * 解析/反序列化用户选项配置
 * — blacklist 和 care 在 chrome.storage 中以 JSON 字符串存储
 *
 * @param {*} options 原始选项对象
 * @returns 解析后的选项对象
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
