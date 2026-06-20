import { onMounted, onUnmounted } from 'vue'
import { sendTabsMessage } from '@/common/utils/chromeUtil'
import { TABS_EVENT } from '@/common/constant/Constant'

/**
 * 聊天消息列表点击事件处理 composable
 * — 图片点击 → 通知 content-scripts 展示大图
 * — 链接点击 → 调用自定义 handler 处理用户卡片、话题跳转等
 *
 * @param {string} containerId 消息容器的 DOM ID
 * @param {Function} [clickHandler] 链接点击回调，接收被点击的 <a> DOM 元素
 */
export function useMessageClick(containerId, clickHandler) {
  let el = null

  function onClick(event) {
    const dom = event.target
    // 图片点击：非头像、非表情的图片触发大图展示
    if (
      dom.tagName === 'IMG' &&
      dom.alt !== 'avatar' &&
      dom.className !== 'emoji'
    ) {
      sendTabsMessage({
        type: TABS_EVENT.showImage,
        data: {
          src: dom.src,
          width: dom.naturalWidth,
          height: dom.naturalHeight
        }
      })
      return
    }
    // 链接点击：委托给调用方处理
    if (dom.tagName === 'A' && clickHandler) {
      clickHandler(dom)
    }
  }

  onMounted(() => {
    el = document.getElementById(containerId)
    if (el) {
      el.addEventListener('click', onClick)
    }
  })

  onUnmounted(() => {
    if (el) {
      el.removeEventListener('click', onClick)
    }
  })
}
