import { ZoomieLocalStorage, ZoomieStorage, ZoomieStorageRequest } from "../storage";
import { ZoomieConfig } from "../config";

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();

  const profile = document.querySelector("#current_profile");
  if (profile !== null) {
    profile.textContent = config.currentProfile.name;
    // profile.nodeValue = config.currentProfile.name;
  }

  const saveClickCallback = () => {
    queryAllTabs().then(async (tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url != undefined) {
          chrome.tabs.getZoom(tab.id, function(zoomFactor: number) {
            chrome.windows.get(tab.windowId, (displayInfo) => {
              const request: ZoomieStorageRequest = {
                zoomLevel: zoomFactor,
                profileName: config.currentProfile.name,
                rawUrl: tab.url!,
                display: {
                  width: displayInfo.width,
                  height: displayInfo.height,
                  windowType: displayInfo.type,
                }
              };
              storage.upsave(request);
            });
          });
        }
      }
    });
  }

  const loadClickCallback = () => {
    queryAllTabs().then(async (tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url !== undefined) {
          chrome.tabs.getZoom(tab.id, function(zoomFactor: number) {
            chrome.windows.get(tab.windowId, (displayInfo) => {
              const request: ZoomieStorageRequest = {
                zoomLevel: zoomFactor,
                profileName: config.currentProfile.name,
                rawUrl: tab.url!,
                display: {
                  width: displayInfo.width,
                  height: displayInfo.height,
                  windowType: displayInfo.type,
                }
              };
              storage.load(request);
            });
          });
        }
      }
    })
  };

  const syncClickCallback = () => {
    queryAllTabs().then(async (tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url !== undefined) {
          chrome.tabs.getZoom(tab.id, function(zoomFactor: number) {
            chrome.windows.get(tab.windowId, (displayInfo) => {
              const request: ZoomieStorageRequest = {
                zoomLevel: zoomFactor,
                profileName: config.currentProfile.name,
                rawUrl: tab.url!,
                display: {
                  width: displayInfo.width,
                  height: displayInfo.height,
                  windowType: displayInfo.type,
                }
              };
              storage.load(request);
            });
          });
        }
      }
    });
  };

  const saveButton = document.getElementById('save_btn');
  if (saveButton !== null) {
    saveButton.addEventListener('click', saveClickCallback);
  }
  const loadButton = document.getElementById('load_btn');
  if (loadButton !== null) {
    loadButton.addEventListener('click', loadClickCallback);
  }
  const syncButton = document.getElementById('sync_btn');
  if (syncButton !== null) {
    syncButton.addEventListener('click', syncClickCallback);
  }

}

main();
