browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    browser.tabs.sendMessage(tabId, {
      tabId, changeInfo, tab
    })
  }
})