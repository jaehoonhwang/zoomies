import { ZoomieLocalStorage, ZoomieConfig, ZoomieStorage } from './storage';

chrome.runtime.onInstalled.addListener(function() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  storage.configUpsave(null, null);
});

async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();

  chrome.tabs.onZoomChange.addListener(
    (zoomChangeInfo) => {
      const newZoomChange = zoomChangeInfo.newZoomFactor;
      const tabId = zoomChangeInfo.tabId;

      chrome.tabs.get(tabId, function(tab) {
        const windowId: number =  tab.windowId;
        chrome.windows.get(windowId, (window) => {
          // window.
        });


        if (tab.url !== undefined) {
          storage.upsave(config.currentProfile, tab.url, newZoomChange);
        }
      })
    }
  );

  // TODO(jaehoonh): Seems like chrome.tabs.getAllInWindow can be used.
  // chrome.tabs.getAllInWIndow();

  // https://developer.chrome.com/docs/extensions/reference/system_display/#event-onDisplayChanged
  chrome.system.display.onDisplayChanged.addListener(
    () => {

    }
  )
}

main();
