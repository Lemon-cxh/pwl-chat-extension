import Vue from 'vue'
import App from './App.vue'
import store from '../store'
import { more, openRedPacket } from "../api/chat";
import {
  LOAD_MESSAGE_EVENT,
  MORE_EVENT,
  GET_MORE_EVENT,
  MESSAGE_EVENT,
} from '../constant/ConnectConstant'

Vue.config.productionTip = false
const URL = 'wss://pwl.icu/chat-room-channel'
const MAX_MESSAGE = 200;
let port = null

let count = 0
let popupShow = false

store.dispatch('getUser').then(() => {
  init()
})

window.openSocket = function() {
  init()
}

window.closeSocket = function () {
  if (window.mySocket && window.mySocket.readyState !== WebSocket.CLOSED) {
    window.mySocket.close();
  }
  store.commit('clearMessage')
}

function init() {
  if (window.mySocket && (window.mySocket.readyState === WebSocket.OPEN || window.mySocket.readyState === WebSocket.CONNECTING)) {
    return
  }
  window.mySocket = new WebSocket(URL);
  window.mySocket.onmessage = event => messageHandler(event)
  window.mySocket.onerror = () => {
    setTimeout(() => {
      init()
    }, 5000)
  }
  window.mySocket.onclose = () => {
    setTimeout(() => {
      init()
    }, 5000)
  }
}


function messageHandler(event) {
  let data = JSON.parse(event.data)
  switch (data.type) {
    case 'msg':
      messageEvent(data)
      if (-1 !== data.content.indexOf('"msgType":"redPacket"')) {
        setTimeout(() => {
          openRedPacket({oId: data.oId, apiKey: store.getters.key}).then((res) => {
            console.log(res);
          });
        }, 1000)
      }
      break
    case 'online':
      break
  }
}

chrome.runtime.onConnect.addListener(function (p) {
  clearBadgeText()
  port = p
  p.postMessage({type: LOAD_MESSAGE_EVENT, message: store.getters.message})
  p.onMessage.addListener(function (msg) {
    switch (msg.type) {
      case GET_MORE_EVENT:
        getMoreEvent()
        break
      default:
        break
    }
  })
  p.onDisconnect.addListener(function () {
    popupShow = false
    port.disconnect()
    port = null;
  })
})

function messageEvent(message) {
  if (port) {
    port.postMessage({type: MESSAGE_EVENT, message: message});
  } else {
    if (message.type === 'msg' && -1 !== message.md.indexOf('@' + store.getters.userInfo.userName)) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/128.png',
        title: message.userName + '@了你',
        message: message.md
      });
    }
  }
  store.commit('addMessage', message)
  if (!popupShow) {
    count++
    chrome.browserAction.setBadgeText({ text: '' + count })
  }
  if (store.getters.messageSize > MAX_MESSAGE) {
    let message = store.getters.message.slice(0, MAX_MESSAGE)
    store.commit('setMessage', message)
    store.commit('setPage', MAX_MESSAGE / store.getters.limit + 1)
    if (port) {
      port.postMessage({type: LOAD_MESSAGE_EVENT, message: message})
    }
  }
}

function getMoreEvent() {
  getMore(res => {
    if (port) {
      port.postMessage({type: MORE_EVENT, message: res.data});
    }
    store.commit('concatMessage', res.data);
    store.commit('pagePlus')
  })
}

function getMore(fun) {
  more({page: store.getters.page, apiKey: store.getters.key}).then((res) => {
    if (res.code === 0) {
      store.commit('setLimit', res.data.length)
      fun(res)
    }
  });
}

function clearBadgeText() {
  popupShow = true
  count = 0
  chrome.browserAction.setBadgeText({ text: '' })
}

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app')
