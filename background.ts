import {
  buildStorageRequest,
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

    const request: ZoomieStorageRequest =
      buildStorageRequest(window, config.currentProfile.name,
        tab, newZoomChange)

    storage.upsave(request);
  }
);

chrome.windows.onBoundsChanged.addListener(
  async function(window: chrome.windows.Window) {
    const tabs = await chrome.tabs.query({ windowId: window.id })
    const storage = new ZoomieLocalStorage();
    const config = await storage.configLoad();

    for (const tab of tabs) {
      if (tab.id != undefined && tab.url != undefined) {
        const request: ZoomieStorageRequest = buildStorageRequestWithNoZoom(
          window, config.currentProfile.name, tab);
        const zoomie = await storage.load(request);
        chrome.tabs.setZoom(tab.id!, zoomie.zoomLevel);
      }
    }
  }
);
