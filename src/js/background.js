
//If is not the Firefox browser, add the extraHeaders to the array
let isFirefox = typeof InstallTrigger !== 'undefined';
let extraInfoSpec = !isFirefox ? ['blocking', 'requestHeaders', 'extraHeaders'] : ['blocking', 'requestHeaders'];

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
  }, extraInfoSpec);
