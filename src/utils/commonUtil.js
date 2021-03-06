import { sendTabsMessage } from '../utils/chromeUtil'
import { TABS_EVENT } from '../constant/Constant'

export function clickEventListener(clickUserFunction) {
  document.getElementById('messageList').addEventListener('click', (event) => {
    let dom = event.target
    if (dom.tagName === 'IMG' && dom.className !== 'emoji') {
      showImage(dom)
    }
    if (dom.tagName === 'A') {
      clickA(dom, clickUserFunction)
    }
  })
}

function showImage(dom) {
  sendTabsMessage({
    type: TABS_EVENT.showImage,
    data: {
      src: dom.src,
      width: dom.naturalWidth,
      height: dom.naturalHeight,
    },
  })
}

function clickA(dom, clickUserFunction) {
  if (dom.className === 'name-at') {
    clickUserFunction && clickUserFunction(dom.innerText)
  } else {
    let href = dom.href.replace(
      `${process.env.VUE_APP_BASE_URL}/forward?goto=`,
      ''
    )
    dom.target = '_blank'
    dom.href = decodeURIComponent(href)
  }
}
