chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let img = document.getElementById('pwl-extension-img')
  if (img) {
    if (img.getAttribute('src') !== request.src) {
      img.setAttribute('src', request.src)
      return
    }
    img.style.display = 'none' === img.style.display ? '' : 'none'
    return
  }
  img = document.createElement('img')
  img.setAttribute('id', 'pwl-extension-img')
  img.setAttribute('onclick', 'this.style.display="none"')
  img.setAttribute('src', request.src)
  let div = document.createElement('div')
  div.setAttribute(
    'style',
    'position: fixed;z-index: 9999999999;max-height: 80%;max-width: 60%;overflow: auto;top: 100px;left:50px;'
  )
  document.body.appendChild(div)
  div.appendChild(img)
})
