import { sendTabsMessage } from '../utils/chromeUtil'
import { TABS_EVENT } from '../constant/Constant'

/**
 * 消息中的点击事件
 * @param {*} clickAFunction 点击用户的回调方法
 */
export function clickEventListener(clickAFunction) {
  document.getElementById('messageList').addEventListener('click', (event) => {
    const dom = event.target
    if (
      dom.tagName === 'IMG' &&
      dom.alt !== 'avatar' &&
      dom.className !== 'emoji'
    ) {
      showImage(dom)
      return
    }
    if (dom.tagName === 'A') {
      clickAFunction(dom)
    }
  })
}

/**
 * 在网页上展示图片
 * @param {*} dom dom
 */
function showImage(dom) {
  sendTabsMessage({
    type: TABS_EVENT.showImage,
    data: {
      src: dom.src,
      width: dom.naturalWidth,
      height: dom.naturalHeight
    }
  })
}
