# 架构与目录结构问题清单

## 🔴 严重

### 1. ✅ API 层重复且不一致

- **涉及文件**: ~~`src/background/api/index.js`、`src/popup/utils/request.js`、`src/popup/api/login.js`、`src/popup/api/chatroom.js`~~
- 两个独立的 axios 实例（background / popup），配置不一致——background 有 10s timeout，popup 没有；错误处理也各不相同
- `login` / `getKey`、`getUserInfo`、`send`、`openRedPacket` 在 background 和 popup 中重复定义
- 应抽取公共 API 层到 `src/common/api/`，或者让 popup 只定义自己独有的接口
- **已修复**: 创建 `src/common/api/`，统一 axios 实例 + 拦截器自动注入 apiKey，移除所有手动传递，删除旧文件

### 2. ✅ PrivateChat.vue 直接导入 background manager（跨上下文）

- **涉及文件**: [src/popup/components/PrivateChat.vue:93-95](src/popup/components/PrivateChat.vue#L93-L95)
- Popup 页面直接 `import` 了 `@/background/manager/PrivateChatWebSocketManager` 并调用其函数
- Popup 和 background service worker 是**不同的执行上下文**，popup 拿不到 background 里的 WebSocket 连接，实际效果是 popup 自己又建了一条独立的 WS 连接
- 公私聊走了完全不同的通信路径；popup 关闭后私聊 WS 就丢失
- 对比公聊的正确做法：[ChatRoom.vue:191](src/popup/views/ChatRoom.vue#L191) 使用 `chrome.runtime.connect()` 走消息通道
- 应统一为通过 `chrome.runtime` 消息与 background 通信
- **已修复**：PrivateChat.vue 改为 `chrome.runtime.connect({ name: 'privateChat' })` 独立端口；background 支持双端口并统一管理私聊 WS；新增 EVENT 常量（15-18）用于 popup↔background 私聊消息路由

### 3. ✅ storageManager.js 不是真正的 "common"

- **涉及文件**: [src/common/manager/StorageManager.js](src/common/manager/StorageManager.js)
- 放在 `src/common/` 下，但导入了 `@/background/api/index`（`getUserInfo`、`login`）
- 这意味着它只能在 background 上下文使用，不应放在 `common/`
- 应把 API 调用上移到调用方，或将文件移入 `src/background/`
- **已修复**: 改为从 `@/common/api/auth` 导入，不再依赖 background，成为真正的 common 模块

---

## 🟡 中等

### 4. ✅ 消息处理逻辑三处重复

- **涉及文件**: `src/popup/store/index.js`、`src/popup/views/ChatRoom.vue`、`src/devtools/App.vue`
- 「+1 折叠」、「红包状态更新」、「撤回消息」三套逻辑在 store、ChatRoom、devtools 中各自实现了一遍，代码 80% 相同
- 应提取为公共 composable 或工具函数
- **已修复**：提取到 `src/common/utils/messageUtil.js`（foldNewMessage / concatWithFold / unshiftWithFold / updateRedPacketStatus / revokeMessage），三处统一调用

### 5. ✅ `modifyContent` 内容转换逻辑分叉

- **涉及文件**: [src/popup/components/Message.vue](src/popup/components/Message.vue)（150+ 行）、[src/devtools/App.vue](src/devtools/App.vue)
- `Message.vue` 处理音乐卡片、天气卡片、话题标签、blockquote 折叠
- `devtools/App.vue` 只处理 blockquote，且实现不同
- 应提取为公共内容格式化工具函数，按消息类型拆分
- **已修复**：提取到 `src/common/utils/contentUtil.js`（formatMusicContent / formatWeatherContent / beautifyTopicTag / foldBlockquote / formatContent），两处统一调用

### 6. `TABS_EVENT` 值类型不一致
scm-history-item:e%3A%5CProject%5Cpwl-chat-extension?%7B%22repositoryId%22%3A%22scm0%22%2C%22historyItemId%22%3A%2246f3e3fd8c7c6dd3bcf42b76db50d592c022be95%22%2C%22historyItemParentId%22%3A%22cc66a76653715e0875c347161d4c7104e54f80a4%22%2C%22historyItemDisplayId%22%3A%2246f3e3f%22%7D
- **涉及文件**: [src/common/constant/Constant.js](src/common/constant/Constant.js)
- 一部分值是数字（`showImage: 1`、`message: 2`、`syncOptions: 4`），另一部分是字符串（`sendMessage: 'sendMessage'`、`openRedPacket: 'openRedPacket'`）
- 容易在比较时埋 bug，应统一为一种类型

### 7. PrivateChat.vue 自成体系、API 响应约定不一致

- **涉及文件**: [src/popup/components/PrivateChat.vue](src/popup/components/PrivateChat.vue)（616 行）
- 独立管理自己的 WebSocket、消息分页、时间格式化，与 ChatRoom 模式完全不同
- 使用 `response.result === 0` 检查 API 返回，而其他所有 API 使用 `res.code === 0`
- 应统一 API 响应字段约定，并将 WS 通信改为走 background 消息通道

### 8. Vuex store 和 ChatRoom.vue 消息状态不统一

- **涉及文件**: `src/popup/store/index.js`、`src/popup/views/ChatRoom.vue`
- `ChatRoom.vue` 的 `setup()` 通过 `ref` 维护独立的 `messageArray`，未使用 store 的 `state.message`
- Store 的 mutations（`addMessage`、`concatMessage`）和 ChatRoom 的方法（`messageEvent`、`load`/`more`）在做重复的折叠去重
- 应统一数据源——要么全部走 store，要么去掉 store 中的 message state

---

## 🟢 轻微

### 9. utils 文件碎片化

- **涉及文件**: `src/common/utils/ObjectUtil.js`、`util.js`、`commonUtil.js`、`chromeUtil.js`
- `ObjectUtil.js`（9 行）：两个方法包装成 class（非 JS 惯例），可合并到 `util.js`
- `commonUtil.js`：`clickEventListener` 既不是 common 也不是 util——硬编码了 `#messageList` 和 fishpi.cn URL 解析
- `chromeUtil.js`：混合了 Chrome API 封装和业务逻辑（`formatOptions` 解析黑名单/特别关心）
- 建议：`chromeUtil.js` 拆出 `options.js`；`ObjectUtil.js` 合并进 `util.js`；`commonUtil.js` 改为 Vue composable

### 10. 组件目录扁平化

- **涉及目录**: `src/popup/components/`（18 个 Vue 文件平铺）
- 建议按功能分组：
  ```
  components/
    chat/        ← Message, Send, HintMessage, Emoji, Images, Via
    red-packet/  ← RedPacket, RedPacketInfo, RedPacketMessage
    user/        ← UserCard, UserInfo, UserSelect, Online
    private-chat/← PrivateChat, TransferDialog
    common/      ← Icon-svg
    discuss/     ← Discuss
  ```

### 11. background/index.js 职责过多

- **涉及文件**: [src/background/index.js](src/background/index.js)（约 300 行）
- 混合了 WS 连接管理、消息路由分发、@ 通知与 badge、特别关心/黑名单过滤、重连检测
- 建议拆分为独立 handler 模块：`messageHandler.js`、`notificationHandler.js`、`reconnectHandler.js`

### 12. 常量文件分散且类型混杂

- **涉及目录**: `src/common/constant/`
- `Constant.js` — 消息类型、storage key、事件、默认配置
- `NotificationConstant.js` — 通知类型映射
- `RedPacketConstant.js` — 红包类型定义
- `RuleConstant.js` — 表单验证规则**生成函数**（不是常量）
- `RuleConstant.js` 应移到 `utils/`，或重命名为 `formRules.js`

### 13. views 与 components 边界模糊

- `PrivateChat.vue` 放在 `components/` 下，但它有独立路由 `/private-chat/:username`，本质上是一个页面级组件
- `views/PrivateChatList.vue` 在 `views/` 下，与之对应的 `PrivateChat.vue` 却不在
- 建议：所有有路由的组件统一放入 `views/`

### 14. commonUtil.js 命名误导

- **涉及文件**: [src/common/utils/commonUtil.js](src/common/utils/commonUtil.js)
- `clickEventListener` 硬编码了 `document.getElementById('messageList')` 和内联的 fishpi.cn URL 解析
- 既不 common（只在特定 DOM 下可用），也不是 util（是具体业务逻辑）
- 建议改为 Vue 指令或 composable，放入 popup 目录

### 15. devtools 入口几乎未使用

- **涉及文件**: `src/devtools/`、[vue.config.js](vue.config.js)（多页配置中的 devtools 入口）
- `devtools` 作为一个独立入口被配置、打包，但功能与 popup 高度重叠
- 评估是否值得维护——如不需要可移除，简化多页配置


### 16. 样式问题

- 聊天框自己发送的消息(右侧)矩形框和三角形中间还有缝隙
- 很多页面通常会出现多个滚动条，超出元素范围。例如：通知帖子列表、详情
- 聊天室页面的话题框，如果话题字数太多点击修改的时候话题框的宽度会变形
- 通知页面的样式有时候看不清文字
- 清风明月的样式和其他页面不一致