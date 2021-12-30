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
  nameOrEmail: 'nameOrEmailStorage',
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
  syncOptions: 9
}

export const TABS_EVENT = {
  showImage: 1,
  message: 2,
  sendMessage: 3,
  syncOptions: 4
}

export const defaultOptions = {
  atNotification: true, plusOne: true, barrageOptions: {
    enable: false,
    fontSize: 16,
    opacity: 0.5,
    color: '#FFFFFF',
  }
}

export const MESSAGE_LIMIT = 25;