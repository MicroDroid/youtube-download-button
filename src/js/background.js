
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    let header = details.requestHeaders.find(h => h.name === 'Cookie');
    if (header) { header.value = ''; }
    return { requestHeaders: details.requestHeaders };
  }, {
    urls: [
      'https://www.youtube.com/watch?v=*',
      'https://www.youtube.com/get_video_info*'
    ],
    types: ['xmlhttprequest'],
  }, ['blocking', 'requestHeaders', "extraHeaders"]);
