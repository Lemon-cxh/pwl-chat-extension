// 消息类型
export const MESSAGE_TYPE = {
  msg: 'msg',
  online: 'online',
  revoke: 'revoke',
  redPacketStatus: 'redPacketStatus',
  discussChanged: 'discussChanged',
}

// storage存储key
export const STORAGE = {
  key: 'keyStorage',
  account: 'accountStorage',
  liveness: 'livenessStorage',
  options: 'options',
  discussEnable: 'discussEnable',
}

// background和popup通信类型
export const EVENT = {
  loadMessage: 1,
  more: 2,
  getMore: 3,
  message: 4,
  redPacketStatus: 5,
  revoke: 6,
  online: 7,
  syncUserInfo: 8,
  markRedPacket: 10,
  discussChanged: 11,
  sendMessage: 12,
  userInfo: 13,
}

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
  markRedPacket: 6,
}

export const defaultOptions = {
  atNotification: true,
  barrageOptions: {
    enable: false,
    fontSize: 16,
    opacity: 0.5,
    color: '#000000',
  },
  hideRedPacketMessage: true,
  blacklist: '',
  care: '',
}

export const MESSAGE_LIMIT = 25
