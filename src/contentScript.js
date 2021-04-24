'use strict';
// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
// 加载页面时自动注入
chrome.storage.sync.get(['__FILEZ_GRAY_FLAG__'], (res) => {
  injectFilezGrayFlag(res.__FILEZ_GRAY_FLAG__)
  console.log('initial inject done')
})

// 监听变化，即时注入
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.hasOwnProperty('__FILEZ_GRAY_FLAG__')) {
    injectFilezGrayFlag(changes.__FILEZ_GRAY_FLAG__.newValue)
    console.log('sync inject done')
  }
})

// 注入 __FILEZ_GRAY_FLAG__
function injectFilezGrayFlag(flag) {
  let injectScript = null
  if (flag) {
    // 测试注入
    injectScript = function script() {
      window.__FILEZ_GRAY_FLAG__ = true
    }
  } else {
    injectScript = function script() {
      window.__FILEZ_GRAY_FLAG__ = false
    }
  }
  inject(injectScript)
}

// 注入脚本
function inject(fn) {
  const id = '__FILEZ__' + new Date().getTime()
  const script = document.createElement('script')
  script.id = id
  script.text = `(${fn.toString()})();`
  document.documentElement.appendChild(script)
  setTimeout(() => {
    document.documentElement.removeChild(document.querySelector(`#${id}`));
  }, 50)
}
