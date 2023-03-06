import {
  buildStorageRequestWithNoZoom, ZoomieLocalStorage,
  ZoomieStorage, ZoomieStorageRequest
} from './storage';
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
  }
);

chrome.windows.onBoundsChanged.addListener(
  async function(window: chrome.windows.Window) {
    const tabs = await chrome.tabs.query({ windowId: window.id })
    const storage = new ZoomieLocalStorage();
    const config = await storage.configLoad();

    for (const tab of tabs) {
      if (tab.id && tab.url != undefined) {
        chrome.windows.get(tab.windowId, async function(window) {
          const request: ZoomieStorageRequest = buildStorageRequestWithNoZoom(
            window, config.currentProfile.name, tab);
          const zoomie = await storage.load(request);
          chrome.tabs.setZoom(tab.id!, zoomie.zoomLevel);
        });
      }
    }
  }
);
