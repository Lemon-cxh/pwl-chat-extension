export const type = new Map([
  [
    'commented',
    {
      title: 'commentArticleTitle',
      avatar: 'commentAuthorThumbnailURL',
      url: 'commentSharpURL',
      userName: 'commentAuthorName',
      content: 'commentContent',
      time: 'commentCreateTime',
    },
  ],
  [
    'reply',
    {
      title: 'commentArticleTitle',
      avatar: 'commentAuthorThumbnailURL',
      url: 'commentSharpURL',
      userName: 'commentAuthorName',
      content: 'commentContent',
      time: 'commentCreateTime',
    },
  ],
  [
    'at',
    {
      '38': 
      {
        title: '聊天室消息',
        avatar: 'userAvatarURL',
        userName: 'userName',
        content: 'content',
        time: 'createTime',
      },
      '39': {
        title: '聊天室红包',
        avatar: 'userAvatarURL',
        userName: 'userName',
        content: 'content',
        time: 'createTime',
      },      
      '24':
      {
        title: '帖子',
        avatar: 'thumbnailURL',
        userName: 'userName',
        content: 'description',
        time: 'createTime',
      },
      '27':
      {
        title: '帖子',
        avatar: 'thumbnailURL',
        userName: 'userName',
        content: 'description',
        time: 'createTime',
      }
    },
  ],
  [
    'following',
    {
      title: 'articleTitle',
      avatar: 'thumbnailURL',
      url: 'url',
      userName: 'authorName',
      content: 'articleTags',
      time: 'createTime',
    },
  ],
  [
    'point',
    {
      content: 'description',
      time: 'createTime',
    },
  ],
  ['broadcast', { label: '平分红包', count: 2, msg: '平分红包，人人有份!' }],
  [
    'sys-announce',
    {
      content: 'description',
      time: 'createTime',
    },
  ],
])
