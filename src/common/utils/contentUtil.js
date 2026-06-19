/**
 * 消息内容格式化工具
 * 处理音乐卡片、天气卡片、话题标签美化和 blockquote 折叠
 */

// 天气图标映射
const WEATHER_CODE_MAP = {
  CLEAR_DAY: '☀️',
  PARTLY_CLOUDY_DAY: '⛅',
  PARTLY_CLOUDY_NIGHT: '🌙',
  CLOUDY: '☁️',
  LIGHT_RAIN: '🌧️',
  MODERATE_RAIN: '🌦️',
  HEAVY_RAIN: '⛈️',
  SNOW: '❄️',
  FOG: '🌫️',
  WIND: '💨',
  HAZE: '🌁',
  SLEET: '🌨️',
  THUNDER: '⛈️',
  SUNNY: '☀️',
  OVERCAST: '☁️',
  RAIN: '🌧️',
  '': '❓'
}

/**
 * 格式化音乐卡片消息
 * @param {string} content - 消息内容
 * @returns {string|null} 格式化后的 HTML，如果不是音乐消息则返回 null
 */
export function formatMusicContent(content) {
  if (!content.includes('"msgType":"music"')) return null
  try {
    const musicData = JSON.parse(content)
    return `
      <div class='music-card'>
        <div class='music-header'>
          <img src='${musicData.coverURL}' class='music-cover' />
          <div class='music-title'>${musicData.title}</div>
        </div>
        <audio controls>
          <source src="${musicData.source}" type="audio/mpeg">
          您的浏览器不支持 audio 元素。
        </audio>
      </div>
    `
  } catch (e) {
    console.error('音乐消息解析失败:', e)
    return null
  }
}

/**
 * 格式化天气卡片消息
 * @param {string} content - 消息内容
 * @returns {string|null} 格式化后的 HTML，如果不是天气消息则返回 null
 */
export function formatWeatherContent(content) {
  if (!content.includes('"msgType":"weather"')) return null
  try {
    const weatherData = JSON.parse(content)
    const dates = weatherData.date.split(',')
    const weatherCodes = weatherData.weatherCode.split(',')
    const mins = weatherData.min.split(',').map(Number)
    const maxs = weatherData.max.split(',').map(Number)
    let weatherHtml = `
      <div class='weather-card-2'>
        <div class='weather-city-2'>${weatherData.t}</div>
        <div class='weather-status-2'>${weatherData.st}</div>
        <div class='weather-forecast-2'>
    `
    for (let i = 0; i < dates.length; i++) {
      weatherHtml += `
        <div class='weather-day-2'>
          <div class='weather-date-2'>${dates[i]}</div>
          <div class='weather-icon-2'>${WEATHER_CODE_MAP[weatherCodes[i]] || '❓'}</div>
          <div class='weather-temp-max-2'>${maxs[i]}°C</div>
          <div class='weather-temp-min-2'>${mins[i]}°C</div>
        </div>
      `
    }
    return weatherHtml
  } catch (e) {
    console.error('天气消息解析失败:', e)
    return null
  }
}

/**
 * 美化话题标签格式
 * 将 <em><code># topic #</code></em> 转为 Element Plus tag 样式
 * @param {string} content - 消息内容
 * @returns {string} 处理后的内容
 */
export function beautifyTopicTag(content) {
  return content.replaceAll(
    /(<em><code>#\s)(.{1,16})(\s#<\/code><\/em>)/g,
    "<span class='el-tag' style='margin: 1px 0;'>$2</span>"
  )
}

/**
 * 折叠 blockquote 引用内容
 * 将非手动引用的 blockquote 包裹在可展开的 details 元素中
 * @param {string} content - 消息内容
 * @param {boolean} hideBlockquote - 是否折叠 blockquote
 * @returns {string} 处理后的内容
 */
export function foldBlockquote(content, hideBlockquote) {
  if (!hideBlockquote) return content
  return content.replaceAll(
    /((?<!引用(.|\n)+)<blockquote>)((.|\n)+)(<\/blockquote>)/g,
    '<details><summary></summary><blockquote>$3</blockquote></details>'
  )
}

/**
 * 统一格式化消息内容——依次应用所有转换
 * @param {string} content - 原始消息内容
 * @param {boolean} hideBlockquote - 是否折叠 blockquote
 * @returns {string} 格式化后的 HTML
 */
export function formatContent(content, hideBlockquote) {
  // 1. 音乐卡片
  const music = formatMusicContent(content)
  if (music) return music

  // 2. 天气卡片
  const weather = formatWeatherContent(content)
  if (weather) return weather

  // 3. 话题标签美化
  const result = beautifyTopicTag(content)

  // 4. Blockquote 折叠
  return foldBlockquote(result, hideBlockquote)
}
