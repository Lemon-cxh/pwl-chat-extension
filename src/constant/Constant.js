// 消息类型
export const MESSAGE_TYPE = {
  msg: 'msg',
  online: 'online',
  revoke: 'revoke',
  redPacketStatus: 'redPacketStatus',
}

// storage存储key
export const STORAGE = {
  key: 'keyStorage',
  account: 'accountStorage',
  liveness: 'livenessStorage',
  options: 'options'
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
  syncOptions: 9,
  markRedPacket: 10
}

export const TABS_EVENT = {
  showImage: 1,
  message: 2,
  sendMessage: 3,
  syncOptions: 4,
  openRedPacket: 5,
  markRedPacket: 6
}

export const defaultOptions = {
  atNotification: true, barrageOptions: {
    enable: false,
    fontSize: 16,
    opacity: 0.5,
    color: '#FFFFFF',
  },
  blacklist: [],
  care: []
}

export const MESSAGE_LIMIT = 25;