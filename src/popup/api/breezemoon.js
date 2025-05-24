import request from '@/popup/utils/request'

// 获取清风明月列表
export function getBreezemoons(params) {
  return request({
    url: '/api/breezemoons',
    method: 'get',
    params
  })
}

// 发布清风明月
export function postBreezemoon(data) {
  return request({
    url: '/breezemoon',
    method: 'post',
    data
  })
}

// 获取指定用户的清风明月列表
export function getUserBreezemoons(userName, params) {
  return request({
    url: `/api/user/${userName}/breezemoons`,
    method: 'get',
    params
  })
}
