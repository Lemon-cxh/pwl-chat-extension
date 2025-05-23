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
