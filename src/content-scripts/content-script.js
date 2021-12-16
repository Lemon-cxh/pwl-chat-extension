chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let img = document.getElementById('pwl-extension-img');
  if (img) {
    if (img.getAttribute('src') !== request.src) {
      img.setAttribute('src', request.src);
      return;
    }
    img.style.display = 'none' === img.style.display ? '' : 'none'
    return;
  }
  img = document.createElement('img');
  img.setAttribute('id', 'pwl-extension-img')
  img.setAttribute('onclick', 'this.style.display="none"')
  img.setAttribute("style", "position: fixed;z-index: 999;max-height: 80%;max-width: 60%;top: 100px;left:50px;")
  img.setAttribute('src', request.src);
  document.body.appendChild(img);
})