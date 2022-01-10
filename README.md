## 摸鱼派聊天室浏览器扩展

[Chrome Web Store](https://chrome.google.com/webstore/detail/%E6%91%B8%E9%B1%BC%E6%B4%BE%E8%81%8A%E5%A4%A9%E5%AE%A4/fkaomdjjdbglkbcmfhhlioejkpacbbpe?hl=zh-CN&authuser=0) | [Microsoft Store](https://microsoftedge.microsoft.com/addons/detail/%E6%91%B8%E9%B1%BC%E6%B4%BE%E8%81%8A%E5%A4%A9%E5%AE%A4/oldbilakhdpiamjbkocdcdnlnakainfm)

基于[摸鱼派](https://fishpi.cn)开放 API 开发的聊天室扩展

### 功能说明
  - 每日登录自动领取昨日活跃
  - 右击消息可以@用户、+1消息、引用消息、收藏表情
  - 点击输入框旁的头像可以查看通知、设置
  - 可以开启弹幕消息，在网页中以弹幕的形式展示消息
  - 有红包时会自动抢红包(延时三秒)
  - 点击用户头像展示用户信息卡片，卡片中点击头像跳转用户页面

### 项目说明

基于Vue3 + Element Plus, Element Plus使用自动导入，封装了SVG组件`Icon-svg`。

#### 热加载以进行开发
```
npm run serve
```

#### 打包
```
npm run build
```
