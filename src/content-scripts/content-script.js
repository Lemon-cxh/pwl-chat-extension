import { TABS_EVENT, STORAGE, defaultOptions } from '../constant/Constant'
import { getSync } from '../utils/chromeUtil'
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
  count: 0,
}
let options = {}

window.onload = function () {
  getSync({ [STORAGE.options]: defaultOptions }, (result) => {
    options = result.options
    height = options.barrageOptions.fontSize
    if (options.barrageOptions.enable) {
      createBarrage()
    }
  })
}

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

function createBarrage() {
  let div = document.createElement('div')
  div.setAttribute('class', 'pwl-message-fixed-box')
  document.body.appendChild(div)
  let box = document.createElement('div')
  box.setAttribute('id', 'pwl-message-box')
  box.setAttribute('class', 'pwl-message-box')
  div.appendChild(box)
  let input = document.createElement('input')
  input.setAttribute('id', 'pwl-input')
  input.setAttribute('class', 'pwl-message-input')
  document.body.appendChild(input)
  input.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
      sendMessage(input)
    }
  })

  var observe = new MutationObserver(function () {
    let imgs = box.querySelectorAll('img')
    imgs.forEach((e) => {
      e.onmouseover = () => (e.style = 'max-height: 100vh;max-width: 60vw;')
      e.onmouseout = () => (e.style = '')
    })
  })
  observe.observe(box, { childList: true })
}

function sendMessage(input) {
  if (input.value === '') {
    return
  }
  chrome.runtime.sendMessage({
    type: TABS_EVENT.sendMessage,
    data: input.value,
  })
  input.value = ''
}

function insetMessage(data) {
  let redPacket = isRedPacket(data)
  if (!redPacket && lastMessage.md === data.md && plusOneMessage(data)) {
    return
  }
  let name = data.userNickname
    ? `${data.userNickname}(${data.userName})`
    : data.userName
  lastMessage = {
    md: data.md,
    oId: data.oId,
    userName: name,
    count: 0,
  }
  let box = document.getElementById('pwl-message-box')
  let child = document.createElement('div')
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
  let second = getSecond(box, child)
  child.setAttribute('style', getSytle(child, second, data.isCare))
  if (redPacket) {
    redPacketClick(child)
  }
  setTimeout(() => {
    box.removeChild(child)
  }, second * 1000)
}

function redPacketClick(child) {
  child.addEventListener('click', () => {
    if (child.getAttribute('open')) {
      return
    }
    child.setAttribute('open', true)
    chrome.runtime.sendMessage({
      type: TABS_EVENT.openRedPacket,
      data: child.id.substring(12),
    })
  })
}

function markRedPacket(data) {
  let child = document.getElementById('pwl-message-' + data.oId)
  let got = data.data.who.find((e) => data.userName === e.userName)
  child.innerHTML += `[${got ? `抢到了${got.userMoney}` : '没有抢到'}]`
}

function showImage(data) {
  let img = document.getElementById('pwl-extension-img')
  if (img) {
    if (img.getAttribute('src') !== data.src) {
      img.setAttribute('src', data.src)
      return
    }
    img.style.display = 'none' === img.style.display ? '' : 'none'
    return
  }
  img = document.createElement('img')
  img.setAttribute('id', 'pwl-extension-img')
  img.setAttribute('alt', 'pwl-img')
  img.setAttribute('style', 'max-width: 60vw;')
  img.setAttribute('referrerpolicy', 'no-referrer')
  img.setAttribute('onclick', 'this.style.display="none"')
  img.setAttribute('src', data.src)
  let div = document.createElement('div')
  div.setAttribute('class', 'pwl-extension-img')
  document.body.appendChild(div)
  div.appendChild(img)
}

function plusOneMessage() {
  let box = document.getElementById('pwl-message-' + lastMessage.oId)
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
  let top = index * height
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
