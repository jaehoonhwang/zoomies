chrome.tabs.query({}).then(
  (tabs) => {
    console.log(tabs);
    return tabs;
  }
).then((tabs) => {
  for (let tab of tabs) {
    if (tab.id) {
      chrome.tabs.getZoom(tab.id, function(zoomFactor: number) {
        console.log(zoomFactor);
      })
    }

  }
});
