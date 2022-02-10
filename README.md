## 摸鱼派聊天室浏览器扩展

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Lemon-cxh/pwl-chat-extension)
![GitHub repo size](https://img.shields.io/github/repo-size/Lemon-cxh/pwl-chat-extension)
![GitHub top language](https://img.shields.io/github/languages/top/Lemon-cxh/pwl-chat-extension)
![GitHub last commit](https://img.shields.io/github/last-commit/Lemon-cxh/pwl-chat-extension)
![GitHub all releases](https://img.shields.io/github/downloads/Lemon-cxh/pwl-chat-extension/total?color=blue)
![GitHub watchers](https://img.shields.io/github/watchers/Lemon-cxh/pwl-chat-extension)
![GitHub followers](https://img.shields.io/github/followers/Lemon-cxh)
![GitHub User's stars](https://img.shields.io/github/stars/Lemon-cxh/pwl-chat-extension)

[Chrome Web Store](https://chrome.google.com/webstore/detail/%E6%91%B8%E9%B1%BC%E6%B4%BE%E8%81%8A%E5%A4%A9%E5%AE%A4/fkaomdjjdbglkbcmfhhlioejkpacbbpe?hl=zh-CN&authuser=0)
![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fkaomdjjdbglkbcmfhhlioejkpacbbpe?logo=GoogleChrome&logoColor=white&label=version&color=success)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fkaomdjjdbglkbcmfhhlioejkpacbbpe?color=blue)
![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/fkaomdjjdbglkbcmfhhlioejkpacbbpe?color=red)

[Microsoft Web Store](https://microsoftedge.microsoft.com/addons/detail/%E6%91%B8%E9%B1%BC%E6%B4%BE%E8%81%8A%E5%A4%A9%E5%AE%A4/oldbilakhdpiamjbkocdcdnlnakainfm)
![Microsoft Store](https://img.shields.io/badge/dynamic/json?logo=MicrosoftEdge&label=version&prefix=v&query=%24.version&color=success&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Foldbilakhdpiamjbkocdcdnlnakainfm%3Fhl%3Dzh-CN%26gl%3DCN)
![Microsoft Store](https://img.shields.io/badge/dynamic/json?label=user&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Foldbilakhdpiamjbkocdcdnlnakainfm%3Fhl%3Dzh-CN%26gl%3DCN)
![Microsoft Store](https://img.shields.io/badge/dynamic/json?label=rating&query=%24.averageRating&suffix=%2F5&color=red&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Foldbilakhdpiamjbkocdcdnlnakainfm%3Fhl%3Dzh-CN%26gl%3DCN)

基于[摸鱼派开放 API](https://fishpi.cn/article/1636516552191) 开发的聊天室扩展

### 功能说明
  - 每日登录自动领取昨日活跃
  - 右击消息可以@用户、+1消息、引用消息、收藏表情
  - 点击输入框旁的头像可以查看通知、设置
    - 可以开启弹幕消息，在网页中以弹幕的形式展示消息
    - 可以设置黑名单(屏蔽某人的消息)、特别关心(上下线通知提醒)
  - 有红包时会自动抢红包(延时三秒)
  - 点击用户头像展示用户信息卡片，卡片中点击用户名跳转用户页面

### 项目说明

基于Vue3 + Element Plus(自动导入)，封装了SVG组件`Icon-svg`。

```
.
├── public/
│   ├── _locales/
│   │   └── zh_CN/              - 目录名对应 manifest.json 的 default_locale
│   ├── css/                    - 需要向网页注入的css
│   ├── icons/                  - 扩展所需的Icon
│   ├── image/                  - 图片资源
│   └── browser-extension.html  - 默认html模板
├── src/
│   ├── api/                    - 所有请求
│   ├── components/             - 各个组件
│   ├── constant/               - 常量
│   ├── content-scripts/
│   │   └── content-script.js   - 需要向网页注入的js
│   ├── popup/                  - 点击扩展图标展示的入口页面
│   │   ├── App.vue
│   │   └── main.js
│   ├── router/                 - 路由
│   ├── store/                  - 全局 store 管理
│   ├── svg/                    - svg 文件
│   ├── utils/                  - 工具方法
│   ├── views/                  - 所有view
│   ├── background.js           - 在后台运行的js
│   └── manifest.json           - 扩展配置文件
```

#### 热加载以进行调试
```
npm run serve
```

#### 打包
```
npm run build
```
