import { TABS_EVENT } from '../constant/Constant'
import { getOptions } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'

let height = 25
// 弹幕滚动速度：屏幕宽 / 时间
const speed = 76
// 弹幕所在的行数
let index = 0
let lastMessage = {
  oId: '',
  md: '',
  userName: '',
  count: 0
}
let options = {}

/**
 * 获取设置参数，并创建弹幕
 */
window.onload = async function () {
  options = await getOptions()
  height = options.barrageOptions.fontSize
  if (options.barrageOptions.enable) {
    createBarrage()
  }
}

/**
 * 监控background.js的消息
 */
/* global chrome */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case TABS_EVENT.showImage:
      showImage(request.data)
      break
    case TABS_EVENT.message:
      insetMessage(request.data)
      sendResponse({ hidden: document.hidden })
      break
    case TABS_EVENT.syncOptions:
      options = request.data
      height = options.barrageOptions.fontSize
      break
    case TABS_EVENT.markRedPacket:
      markRedPacket(request.data)
      break
    default:
      break
  }
})

/**
 * 创建弹幕展示的dom
 */
function createBarrage() {
  const div = document.createElement('div')
  div.setAttribute('class', 'pwl-message-fixed-box')
  document.body.appendChild(div)
  const box = document.createElement('div')
  box.setAttribute('id', 'pwl-message-box')
  box.setAttribute('class', 'pwl-message-box')
  div.appendChild(box)
  const input = document.createElement('input')
  input.setAttribute('id', 'pwl-input')
  input.setAttribute('class', 'pwl-message-input')
  document.body.appendChild(input)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage(input)
    }
  })

  // 监听图标的鼠标悬浮事件，变为大图显示
  const observe = new MutationObserver(function () {
    const imgs = box.querySelectorAll('img')
    imgs.forEach((e) => {
      e.onmouseover = () => (e.style = 'max-height: 100vh;max-width: 60vw;')
      e.onmouseout = () => (e.style = '')
    })
  })
  // 开始接收与给定选项匹配的 DOM 变化的通知
  observe.observe(box, { childList: true })
}

/**
 * 发送消息
 * @param {*} input
 * @returns
 */
function sendMessage(input) {
  if (input.value === '') {
    return
  }
  chrome.runtime.sendMessage({
    type: TABS_EVENT.sendMessage,
    data: input.value
  })
  input.value = ''
}

/**
 * 新增新消息
 * @param {*} data
 * @returns
 */
function insetMessage(data) {
  const redPacket = isRedPacket(data)
  if (!redPacket && lastMessage.md === data.md && plusOneMessage(data)) {
    return
  }
  const name = data.userNickname
    ? `${data.userNickname}(${data.userName})`
    : data.userName
  lastMessage = {
    md: data.md,
    oId: data.oId,
    userName: name,
    count: 0
  }
  const box = document.getElementById('pwl-message-box')
  const child = document.createElement('div')
  child.setAttribute('id', 'pwl-message-' + data.oId)
  if (redPacket) {
    child.innerHTML = `🧧${name}的红包来啦,点击领取`
  } else {
    data.content = data.content.substring(3, data.content.length - 4)
    data.content = data.content.replaceAll(
      /(<img )/g,
      '$1referrerpolicy="no-referrer" '
    )
    child.innerHTML = `${data.isCare ? '♥' : ''}${name}:${data.content}${
      data.isCare ? '♥' : ''
    }`
  }
  child.setAttribute(
    'class',
    (redPacket ? 'red-packet ' : '') + 'pwl-message-child'
  )
  box.appendChild(child)
  const second = getSecond(box, child)
  child.setAttribute('style', getSytle(child, second, data.isCare))
  if (redPacket) {
    redPacketClick(child)
  }
  setTimeout(() => {
    box.removeChild(child)
  }, second * 1000)
}

/**
 * 点击红包消息
 * @param {*} child
 */
function redPacketClick(child) {
  child.addEventListener('click', () => {
    if (child.getAttribute('open')) {
      return
    }
    child.setAttribute('open', true)
    chrome.runtime.sendMessage({
      type: TABS_EVENT.openRedPacket,
      data: child.id.substring(12)
    })
  })
}

function markRedPacket(data) {
  const child = document.getElementById('pwl-message-' + data.oId)
  const got = data.data.who.find((e) => data.userName === e.userName)
  child.innerHTML += `[${got ? `抢到了${got.userMoney}` : '没有抢到'}]`
}

function showImage(data) {
  let img = document.getElementById('pwl-extension-img')
  if (img) {
    if (img.getAttribute('src') !== data.src) {
      img.setAttribute('src', data.src)
      return
    }
    img.style.display = img.style.display === 'none' ? '' : 'none'
    return
  }
  img = document.createElement('img')
  img.setAttribute('id', 'pwl-extension-img')
  img.setAttribute('alt', 'pwl-img')
  img.setAttribute('style', 'max-width: 60vw;')
  img.setAttribute('referrerpolicy', 'no-referrer')
  img.setAttribute('src', data.src)
  img.addEventListener('click', () => {
    img.style.display = 'none'
  })
  const div = document.createElement('div')
  div.setAttribute('class', 'pwl-extension-img')
  document.body.appendChild(div)
  div.appendChild(img)
}

function plusOneMessage() {
  const box = document.getElementById('pwl-message-' + lastMessage.oId)
  if (!box) {
    return false
  }
  let plusOne = document.getElementById('pwl-plus-one-' + lastMessage.oId)
  if (plusOne) {
    plusOne.innerText = ` [${++lastMessage.count}人 +1]`
    return true
  }
  plusOne = document.createElement('span')
  plusOne.setAttribute('id', 'pwl-plus-one-' + lastMessage.oId)
  plusOne.innerText = ` [${++lastMessage.count}人 +1]`
  box.appendChild(plusOne)
  return true
}

function getSecond(box, child) {
  return Math.round((box.offsetWidth + child.offsetWidth) / speed)
}

function getSytle(dom, second, isCare) {
  index = (index + 3) % 13
  const top = index * height
  return `font-size: ${options.barrageOptions.fontSize}px;${
    isCare ? 'font-weight: bolder;' : ''
  }opacity: ${options.barrageOptions.opacity};color: ${
    options.barrageOptions.color
  };top: ${top}px;right: -${
    dom.offsetWidth
  }px;transform: translateX(calc(-100vw - ${
    dom.offsetWidth
  }px));transition: transform ${second}s linear;`
}
