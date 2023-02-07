import { ZoomieLocalStorage, ZoomieStorage, ZoomieStorageRequest } from './storage';
import { defaultConfig } from './config';

chrome.runtime.onInstalled.addListener(function() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  storage.configUpsave(defaultConfig);
});

chrome.tabs.onZoomChange.addListener(
  async function(zoomChangeInfo) {
    const newZoomChange = zoomChangeInfo.newZoomFactor;
    const tabId = zoomChangeInfo.tabId;
    const storage = new ZoomieLocalStorage();

    const config = await storage.configLoad();
    const tab = await chrome.tabs.get(tabId);
    if (tab === undefined) {
      return;
    }
    const window = await chrome.windows.get(tab.windowId);

    const request: ZoomieStorageRequest = {
      zoomLevel: newZoomChange,
      profileName: config.currentProfile.name,
      rawUrl: tab.url!,
      display: {
        width: window.width,
        height: window.height,
        windowType: window.type,
      }
    };

    storage.upsave(request);
  });
