# 摸鱼派 (FishPi) 开放 API 参考文档

> 版本：V2.3.2 | 基准 URL：`https://fishpi.cn`
>
> 基于 [fishpi 官方 npm 包](https://www.npmjs.com/package/fishpi) 源码及项目实际调用整理。

---

## 1. 概述

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基准 URL | `https://fishpi.cn` |
| 认证方式 | 通过 `apiKey` 参数（登录后获取） |
| 响应格式（常规） | `{ code, msg, data }`，`code === 0` 表示成功 |
| 响应格式（/chat/*） | `{ result, data, cached }`，`result === 0` 表示成功<br>（项目在 `privatechat.js` 中统一映射为 `code`） |
| WebSocket 公聊 | `wss://fishpi.cn/chat-room-channel` |
| WebSocket 用户通道 | `wss://fishpi.cn/user-channel?apiKey=...` |
| WebSocket 私聊 | `wss://fishpi.cn/chat-channel?apiKey=...&toUser=...` |

### 1.2 请求拦截器

本项目通过 Axios 拦截器自动注入 `apiKey`：

- **GET/HEAD/DELETE**：`apiKey` 自动附加到 `params`
- **POST/PUT/PATCH**：`apiKey` 自动附加到 `data`
- **FormData**：由 `upload()` 函数手动处理

### 1.3 响应拦截器

- HTTP `200`：返回 `response.data`（即 `{ code, msg, data }` 结构）
- 非 `200` 或网络错误：触发 `errorHandler`，返回 rejected Promise

---

## 2. 认证 API

### 2.1 登录（获取 API Key）

```
POST /api/getKey
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 账号信息 | `object` | 是 | 用户登录凭证 |

**响应：** `{ code: 0, Key: "<apiKey>", msg: "..." }`

### 2.2 获取当前用户信息

```
GET /api/user
```

**响应：** `{ code: 0, data: { userName, userAvatarURL, ... } }`

---

## 3. 公聊 (Chat Room) API

### 3.1 获取频道节点

```
GET /chat-room/node/get
```

**说明：** 获取可用的 WebSocket 节点地址，返回的 `data` 即为 `wss://` 连接地址。

**响应：** `{ code: 0, data: "wss://fishpi.cn/chat-room-channel" }`

### 3.2 获取消息列表

```
GET /chat-room/getMessage
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | `number` | 否 | 页码 |
| `pageSize` | `number` | 否 | 每页条数 |

**响应：** `{ code: 0, data: [消息数组] }`

### 3.3 加载更多消息

```
GET /chat-room/more
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `oId` | `string` | 是 | 起始消息 ID |

**响应：** `{ code: 0, data: [消息数组] }`

### 3.4 发送消息

```
POST /chat-room/send
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | `string` | 是 | 消息内容（支持 Markdown） |
| `client` | `string` | 自动 | 客户端标识，由请求模块自动生成 |

**响应：** `{ code: 0 }`

### 3.5 撤回消息

```
DELETE /chat-room/revoke/{oId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `oId` | `string` | 是 | 消息 ID（路径参数） |

### 3.6 获取原始 Markdown

```
GET /cr/raw/{oId}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `oId` | `string` | 是 | 消息 ID（路径参数） |

**响应：** 消息的原始 Markdown 内容

### 3.7 红包相关

#### 领取红包

```
POST /chat-room/red-packet/open
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `oId` | `string` | 是 | 红包消息 ID |

**响应：** `{ code: 0, data: { who: [...], got: [...] } }`

### 3.8 文件上传

```
POST /upload
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file[]` | `File` | 是 | 上传文件（FormData） |

**请求格式：** `multipart/form-data`（`apiKey` 需手动加入 FormData）

### 3.9 表情与图床

#### 获取表情列表

```
GET /users/emotions
```

#### 获取图床图片

```
POST /api/cloud/get
```

#### 同步图床图片

```
POST /api/cloud/sync
```

---

## 4. 私聊 (Private Chat) API

> **重要：** 所有 `/chat/*` 端点的响应字段名是 `result`（不是 `code`），格式为 `{ result, data, cached }`。
> 项目的 `privatechat.js` 会在 API 层将 `result` 统一映射为 `code`，上层代码统一使用 `code === 0` 判断。

### 4.1 获取聊天列表

```
GET /chat/get-list
```

**响应：** `{ code: 0, data: [{ oId, receiverUserName, receiverAvatar, preview, time, user_session }, ...] }`

### 4.2 获取聊天消息

```
GET /chat/get-message
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `toUser` | `string` | 是 | 对方用户名 |
| `page` | `number` | 否 | 页码（默认 1） |
| `pageSize` | `number` | 否 | 每页条数（默认 20） |

**响应：** `{ code: 0, data: [{ oId, senderAvatar, senderUserName, content, time, type }, ...] }`

### 4.3 标记已读

```
GET /chat/mark-as-read
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fromUser` | `string` | 是 | 对方用户名 |

### 4.4 检查未读消息

```
GET /chat/has-unread
```

**响应：** `{ code: 0, data: [{ user_session, ... }] }`

> `data` 为未读消息的用户会话数组，空数组表示无未读。

---

## 5. 用户 API

### 5.1 获取活跃度

```
GET /user/liveness
```

### 5.2 获取昨日活跃度奖励

```
GET /activity/yesterday-liveness-reward-api
```

### 5.3 查询活跃度是否已领取

```
GET /api/activity/is-collected-liveness
```

### 5.4 获取用户信息

```
GET /user/{userName}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userName` | `string` | 是 | 用户名（路径参数） |

### 5.5 批量获取用户名

```
POST /users/names
```

### 5.6 关注用户

```
POST /follow/user
```

### 5.7 取消关注

```
POST /unfollow/user
```

### 5.8 转账积分

```
POST /point/transfer
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `toUser` | `string` | 是 | 接收方用户名 |
| `amount` | `number` | 是 | 转账金额 |
| `memo` | `string` | 否 | 转账备注 |

---

## 6. 文章 API

### 6.1 文章列表

| 端点 | 说明 |
|------|------|
| `GET /api/articles/recent` | 最近文章 |
| `GET /api/articles/recent/hot` | 热门文章 |
| `GET /api/articles/recent/good` | 点赞文章 |
| `GET /api/articles/recent/reply` | 最近回复 |

**公共参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `p` | `number` | 否 | 页码 |

### 6.2 文章详情

```
GET /api/article/{articleId}
```

### 6.3 文章互动

#### 点赞文章

```
POST /vote/up/article
```

#### 感谢文章

```
POST /article/thank?articleId={articleId}
```

### 6.4 评论

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/comment/{articleId}` | GET | 获取文章评论列表 |
| `/comment` | POST | 发表评论 |
| `/vote/up/comment` | POST | 点赞评论 |
| `/comment/thank` | POST | 感谢评论 |
| `/comment/{commentId}/remove` | POST | 删除评论 |

---

## 7. 清风明月 (Breezemoon) API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/breezemoons` | GET | 获取清风明月列表 |
| `/breezemoon` | POST | 发布清风明月 |
| `/api/user/{userName}/breezemoons` | GET | 获取指定用户的清风明月 |

---

## 8. 通知 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/getNotifications` | GET | 获取通知列表 |
| `/notifications/unread/count` | GET | 获取未读通知数 |
| `/notifications/make-read/{type}` | GET | 将指定类型通知标记为已读 |

---

## 9. 注册 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/register` | POST | 注册（第一步） |
| `/verify?code={code}` | GET | 验证邮箱验证码 |
| `/register2?r={inviteCode}` | POST | 注册（第二步） |

---

## 10. WebSocket 通信协议

### 10.1 公聊 WebSocket

**连接地址：** `wss://fishpi.cn/chat-room-channel`（或通过 `/chat-room/node/get` 获取）

**心跳机制：** 每 20 秒发送 `-hb-`

**消息格式（服务端 → 客户端）：**

```json
{
  "type": "msg | online | revoke | redPacketStatus | discussChanged | customMessage | barrage",
  "oId": "消息ID",
  "userName": "发送者",
  "md": "消息内容",
  "...": "..."
}
```

**消息类型说明：**

| type | 说明 |
|------|------|
| `msg` | 普通聊天消息 |
| `online` | 在线用户信息 |
| `revoke` | 消息撤回 |
| `redPacketStatus` | 红包领取状态 |
| `discussChanged` | 话题变更 |
| `customMessage` | 自定义消息 |
| `barrage` | 弹幕消息 |

### 10.2 用户通道 WebSocket

**连接地址：** `wss://fishpi.cn/user-channel?apiKey={apiKey}`

**用途：** 累计用户在线时间

### 10.3 私聊 WebSocket

**连接地址：** `wss://fishpi.cn/chat-channel?apiKey={apiKey}&toUser={userName}`

**发送消息：** 直接通过 WebSocket `send()` 发送文本内容（非 JSON）

**接收消息格式：**

```json
{
  "type": "msg",
  "oId": "消息ID",
  "time": "时间戳",
  "senderUserName": "发送者",
  "senderAvatar": "头像URL",
  "content": "消息内容（HTML）"
}
```

**自动重连：** 非正常关闭（`code !== 1000 && code !== 1001`）时自动重连

---

## 11. 扩展内部消息协议

### 11.1 Popup ↔ Background (长连接)

通过 `chrome.runtime.connect()` 建立，端口名为 `'privateChat'`（私聊）或无名称（公聊）。

**EVENT 定义：**

| 常量 | 值 | 方向 | 说明 |
|------|-----|------|------|
| `LOGIN` | 0 | Popup → BG | 登录事件 |
| `LOGIN_OUT` | -1 | Popup → BG | 登出事件 |
| `loadMessage` | 1 | BG → Popup | 初始消息列表 |
| `more` | 2 | BG → Popup | 更多消息 |
| `getMore` | 3 | Popup → BG | 请求更多消息 |
| `message` | 4 | BG → Popup | 新消息 |
| `redPacketStatus` | 5 | BG → Popup | 红包状态 |
| `revoke` | 6 | BG → Popup | 撤回消息 |
| `online` | 7 | BG → Popup | 在线信息 |
| `markRedPacket` | 10 | BG → Popup | 标记红包 |
| `discussChanged` | 11 | BG → Popup | 话题变更 |
| `sendMessage` | 12 | Popup → BG | 发送消息 |
| `userInfo` | 13 | 双向 | 用户信息 |
| `openRedPacket` | 14 | Popup → BG | 领取红包 |
| `openPrivateChat` | 15 | Popup → BG | 打开私聊 WS |
| `closePrivateChat` | 16 | Popup → BG | 关闭私聊 WS |
| `sendPrivateMessage` | 17 | Popup → BG | 发送私聊消息 |
| `privateMessage` | 18 | BG → Popup | 接收私聊消息 |

### 11.2 Content Scripts ↔ Background (一次性消息)

通过 `chrome.runtime.sendMessage()`，使用 `TABS_EVENT` 常量（全部为字符串值）：

| 常量 | 值 | 说明 |
|------|-----|------|
| `showImage` | `'showImage'` | 显示图片 |
| `message` | `'message'` | 网页接收消息 |
| `sendMessage` | `'sendMessage'` | 网页发送消息 |
| `syncOptions` | `'syncOptions'` | 同步配置 |
| `openRedPacket` | `'openRedPacket'` | 网页领取红包 |
| `markRedPacket` | `'markRedPacket'` | 标记红包 |
| `openPrivateChat` | `'openPrivateChat'` | 打开私聊 |
| `closePrivateChat` | `'closePrivateChat'` | 关闭私聊 |
| `privateMessage` | `'privateMessage'` | 私聊消息 |

---

## 12. 项目代码映射

### API 层文件

| 文件 | 对应功能 |
|------|----------|
| [`src/common/api/request.js`](../src/common/api/request.js) | Axios 实例、请求/响应拦截器 |
| [`src/common/api/auth.js`](../src/common/api/auth.js) | 登录、获取用户信息 |
| [`src/common/api/chatroom.js`](../src/common/api/chatroom.js) | 公聊消息、红包、文件、表情、图床 |
| [`src/common/api/privatechat.js`](../src/common/api/privatechat.js) | 私聊列表、消息、已读、未读 |
| [`src/common/api/user.js`](../src/common/api/user.js) | 活跃度、用户信息、关注、转账 |
| [`src/common/api/article.js`](../src/common/api/article.js) | 文章列表、详情、点赞、评论 |
| [`src/common/api/breezemoon.js`](../src/common/api/breezemoon.js) | 清风明月 |
| [`src/common/api/notification.js`](../src/common/api/notification.js) | 通知列表、未读数、标记已读 |
| [`src/common/api/register.js`](../src/common/api/register.js) | 注册、验证 |
| [`src/common/api/channel.js`](../src/common/api/channel.js) | 获取 WS 频道节点 |

### WebSocket 管理层

| 文件 | 对应功能 |
|------|----------|
| [`src/background/manager/WebSocketManager.js`](../src/background/manager/WebSocketManager.js) | 公聊 WS 连接、心跳、重连 |
| [`src/background/manager/PrivateChatWebSocketManager.js`](../src/background/manager/PrivateChatWebSocketManager.js) | 私聊 WS 连接、发送、重连 |

### 通信架构

```
Popup (Vue SPA)
    ↕ chrome.runtime.connect() — 长连接端口
Background (Service Worker)
    ↕ WebSocket — fishpi.cn
    ↕ chrome.runtime.sendMessage() — 一次性消息
Content Scripts (网页注入)
```
