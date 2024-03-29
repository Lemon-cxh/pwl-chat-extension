/**
 * 未读通知的类型及接口字段key
 */
export const NOTIFICATION_TYPE = [
  {
    name: 'commented',
    title: '收到的回帖',
    count: 'unreadCommentedNotificationCnt'
  },
  {
    name: 'reply',
    title: '收到的回复',
    count: 'unreadReplyNotificationCnt'
  },
  {
    name: 'point',
    title: '积分',
    count: 'unreadPointNotificationCnt'
  },
  {
    name: 'at',
    title: '提及我的',
    count: 'unreadAtNotificationCnt'
  },
  {
    name: 'following',
    title: '我关注的',
    count: 'unreadFollowingNotificationCnt'
  },
  {
    name: 'broadcast',
    title: '同城',
    count: 'unreadBroadcastNotificationCnt'
  },
  {
    name: 'sys-announce',
    title: '系统',
    count: 'unreadSysAnnounceNotificationCnt'
  }
]
/**
 * 通知列表接口字段的映射
 */
export const NOTIFICATION_MAPPING = new Map([
  [
    'commented',
    {
      title: 'commentArticleTitle',
      avatar: 'commentAuthorThumbnailURL',
      url: 'commentSharpURL',
      userName: 'commentAuthorName',
      content: 'commentContent',
      time: 'commentCreateTime'
    }
  ],
  [
    'reply',
    {
      title: 'commentArticleTitle',
      avatar: 'commentAuthorThumbnailURL',
      url: 'commentSharpURL',
      userName: 'commentAuthorName',
      content: 'commentContent',
      time: 'commentCreateTime'
    }
  ],
  [
    'at',
    {
      38: {
        title: '聊天室消息',
        avatar: 'userAvatarURL',
        userName: 'userName',
        content: 'content',
        time: 'createTime'
      },
      39: {
        title: '聊天室红包',
        avatar: 'userAvatarURL',
        userName: 'userName',
        content: 'content',
        time: 'createTime'
      },
      24: {
        title: '帖子',
        avatar: 'thumbnailURL',
        userName: 'userName',
        content: 'description',
        time: 'createTime'
      },
      25: {
        title: '帖子',
        avatar: 'thumbnailURL',
        userName: 'userName',
        content: 'description',
        time: 'createTime'
      },
      27: {
        title: '帖子',
        avatar: 'thumbnailURL',
        userName: 'userName',
        content: 'description',
        time: 'createTime'
      },
      2: {
        title: '帖子中提及了你',
        avatar: 'thumbnailURL',
        userName: 'authorName',
        content: 'articleTitle',
        time: 'createTime'
      }
    }
  ],
  [
    'following',
    {
      title: 'articleTitle',
      avatar: 'thumbnailURL',
      url: 'url',
      userName: 'authorName',
      content: 'articleTags',
      time: 'createTime'
    }
  ],
  [
    'point',
    {
      content: 'description',
      time: 'createTime'
    }
  ],
  ['broadcast', { label: '平分红包', count: 2, msg: '平分红包，人人有份!' }],
  [
    'sys-announce',
    {
      content: 'description',
      time: 'createTime'
    }
  ]
])
