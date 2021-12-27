import { TABS_EVENT, STORAGE, defaultOptions } from '../constant/Constant'
import { getSync } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'

const height = 25
// 屏幕宽 / 时间
const speed = 76
let index = 0
let options = {}

window.onload = function () {
  getSync({ [STORAGE.options]: defaultOptions }, (result) => {
    options = result.options
    if (options.barrageMessage) {
      createBarrage()
    }
  })
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (TABS_EVENT.showImage === request.type) {
    showImage(request.data)
    return
  }
  if (TABS_EVENT.message === request.type) {
    insetMessage(request.data)
    sendResponse({ hidden: document.hidden })
    return
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
  let box = document.getElementById('pwl-message-box')
  let child = document.createElement('div')
  child.setAttribute('id', 'pwl-message-' + data.oId)
  let name = data.userNickname
    ? data.userNickname + '(' + data.userName + ')'
    : data.userName
  child.innerText = name + ':' + (isRedPacket(data) ? '[🧧有红包，请在扩展中查看]' : data.md)
  index = ++index % 10
  let top = index * height
  child.setAttribute('class', 'pwl-message-child')
  box.appendChild(child)
  let second = Math.round((box.offsetWidth + child.offsetWidth) / speed)
  child.setAttribute(
    'style',
    'top:' +
      top +
      'px;right:-' + child.offsetWidth + 'px;transform: translateX(calc(-100vw - ' + child.offsetWidth + 'px));transition: transform ' +
      second +
      's linear;'
  )
  setTimeout(() => {
    box.removeChild(child)
  }, second * 1000)
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
  img.setAttribute('onclick', 'this.style.display="none"')
  img.setAttribute('src', data.src)
  let div = document.createElement('div')
  div.setAttribute('class', 'pwl-extension-img')
  document.body.appendChild(div)
  div.appendChild(img)
}
