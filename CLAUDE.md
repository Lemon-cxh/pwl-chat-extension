## 项目概述
浏览器扩展，基于VUE 3 + Element Plus + Manifest V3。
项目结构：
- Background Service Worker — WebSocket 连接管理中心，消息分发，通知管理
- Content Scripts — 网页弹幕注入、图片查看、红包交互
- Popup — 浏览器点击扩展的主界面 UI，Vue Router + Vuex 状态管理，与 background 的通信机制
- Devtools — 浏览器F12控制台入口

通信流程 — WebSocket → Background → Popup（长连接）/ Content-scripts（一次性消息）的完整数据流

## 规范
- 代码符合前端代码规范、Vue 规范
- 需要考虑CSS样式的整体适配及统一
- 代码需要合理的注释说明逻辑
- 文档、注释统一使用中文输出，文件名还是使用英文
- 对所修改后的代码进行检查，确保不会影响其他地方，消除多于无用的代码