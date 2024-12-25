// 消息类型
export const MESSAGE_TYPE = {
  /**
   * 消息
   */
  msg: 'msg',
  /**
   * 在线信息
   */
  online: 'online',
  /**
   * 撤回
   */
  revoke: 'revoke',
  /**
   * 红包领取消息
   */
  redPacketStatus: 'redPacketStatus',
  /**
   * 话题变更
   */
  discussChanged: 'discussChanged',
  /**
   * 用户上下线消息
   */
  customMessage: 'customMessage',
  /**
   * 弹幕消息
   */
  barrager: 'barrager'
}

// storage存储key
export const STORAGE = {
  /**
   * apiKey
   */
  key: 'keyStorage',
  /**
   * 账号
   */
  account: 'accountStorage',
  /**
   * 活跃度
   */
  liveness: 'livenessStorage',
  /**
   * 设置
   */
  options: 'options',
  /**
   * 话题是否启用
   */
  discussEnable: 'discussEnable'
}

// background和popup、devtools通信类型
export const EVENT = {
  /**
   * 登录事件，由 POPUP 页面触发，background 处理事件
   */
  LOGIN: 0,
  /**
   * 初始化页面加载消息
   */
  loadMessage: 1,
  /**
   * 接受消息列表
   */
  more: 2,
  /**
   * 获取消息列表
   */
  getMore: 3,
  /**
   * 新消息
   */
  message: 4,
  /**
   * 红包领取信息
   */
  redPacketStatus: 5,
  /**
   * 撤回消息
   */
  revoke: 6,
  /**
   * 在线人数信息
   */
  online: 7,
  /**
   * 标记红包领取状态
   */
  markRedPacket: 10,
  /**
   * 话题消息
   */
  discussChanged: 11,
  /**
   * 发送消息
   */
  sendMessage: 12,
  /**
   * 获取用户信息
   */
  userInfo: 13,
  /**
   * 领取红包
   */
  openRedPacket: 14
}

/**
 * content-scripts与background通信
 */
export const TABS_EVENT = {
  /**
   * 显示图片
   */
  showImage: 1,
  /**
   * 网页接收消息
   */
  message: 2,
  /**
   * 网页发送消息
   */
  sendMessage: 3,
  /**
   * 同步配置
   */
  syncOptions: 4,
  /**
   * 网页打开红包
   */
  openRedPacket: 5,
  /**
   * 标记红包领取状态
   */
  markRedPacket: 6
}

/**
 * 默认设置
 */
export const defaultOptions = {
  /**
   * @消息通知
   */
  atNotification: true,
  /**
   * 弹幕设置
   */
  barrageOptions: {
    enable: false,
    fontSize: 16,
    opacity: 0.5,
    color: '#000000'
  },
  /**
   * 是否隐藏红包领取消息
   */
  hideRedPacketMessage: true,
  /**
   * 黑名单列表
   */
  blacklist: '',
  /**
   * 特别关心列表
   */
  care: '',
  /**
   * 自动已读@ 通知
   */
  autoReadAtNotification: true,
  /**
   * 自动已读积分通知
   */
  autoReadPointNotification: false,
  /**
   * 显示未读消息总数
   */
  showUnReadCount: true,
  /**
   * 隐藏引用格式的内容
   */
  hideBlockquote: false
}

export const MESSAGE_LIMIT = 25
