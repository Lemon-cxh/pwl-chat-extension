export function getDate() {
  let now = new Date()
  let month = now.getMonth() + 1
  let date = now.getDate()
  return now.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date)
}