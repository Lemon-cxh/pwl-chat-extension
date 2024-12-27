export const defaultType = 'random'

export const rockPaperScissors = 'rockPaperScissors'

export const RED_PACKET_TYPE = [
  { label: '手气红包', value: 'random' },
  { label: '心跳红包', value: 'heartbeat' },
  { label: '专属红包', value: 'specify' },
  { label: '平分红包', value: 'average' },
  { label: '石头剪刀布', value: 'rockPaperScissors' }
]

export const RED_PACKET_MAP = new Map([
  ['random', { label: '手气红包', count: 2, msg: '摸鱼者，事竟成!' }],
  ['heartbeat', { label: '心跳红包', count: 2, msg: '玩的就是心跳!' }],
  [
    'specify',
    { label: '专属红包', count: 1, msg: '试试看，这是给你的红包吗?' }
  ],
  ['average', { label: '平分红包', count: 2, msg: '平分红包，人人有份!' }],
  [rockPaperScissors, { label: '石头剪刀布', count: 1, msg: '石头剪刀布!' }]
])
