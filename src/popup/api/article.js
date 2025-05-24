import request from '@/popup/utils/request'

// 获取最近帖子列表
export function getRecentArticles(params) {
  return request({
    url: '/api/articles/recent',
    method: 'get',
    params
  })
}

// 获取热门帖子列表
export function getHotArticles(params) {
  return request({
    url: '/api/articles/recent/hot',
    method: 'get',
    params
  })
}

// 获取点赞帖子列表
export function getGoodArticles(params) {
  return request({
    url: '/api/articles/recent/good',
    method: 'get',
    params
  })
}

// 获取最近回复帖子列表
export function getReplyArticles(params) {
  return request({
    url: '/api/articles/recent/reply',
    method: 'get',
    params
  })
}

// 获取指定帖子详情
export function getArticleDetail(articleId, params) {
  return request({
    url: `/api/article/${articleId}`,
    method: 'get',
    params
  })
}

// 给文章点赞
export function voteUpArticle(data) {
  return request({
    url: '/vote/up/article',
    method: 'post',
    data
  })
}

// 感谢文章
export function thankArticle(articleId, data) {
  return request({
    url: `/article/thank?articleId=${articleId}`,
    method: 'post',
    data
  })
}

// 获取文章评论列表
export function getArticleComments(articleId, params) {
  return request({
    url: `/api/comment/${articleId}`,
    method: 'get',
    params
  })
}

// 发表评论
export function addComment(data) {
  return request({
    url: '/comment',
    method: 'post',
    data
  })
}

// 给评论点赞
export function voteUpComment(data) {
  return request({
    url: '/vote/up/comment',
    method: 'post',
    data
  })
}

// 感谢评论
export function thankComment(data) {
  return request({
    url: '/comment/thank',
    method: 'post',
    data
  })
}

// 删除评论
export function removeComment(commentId, data) {
  return request({
    url: `/comment/${commentId}/remove`,
    method: 'post',
    data
  })
}
