import {
  ZoomieLocalStorage,
  ZoomieStorage,
  ZoomieStorageRequest,
} from "../storage";
import { updateCurrentProfile, updateProfileSelect } from "../custom/custom";
import { AutoInit, FormSelect } from "materialize-css";
import { ZoomieConfig, CONFIG } from "../config";

const profileSelectName = "#profileSelections";
const currentProfileName = "#current_profile";
const saveElementIDName = "#save_btn";

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

chrome.storage.onChanged.addListener(async function(changes, namespace) {
  if (CONFIG in changes) {
    const storage: ZoomieStorage = new ZoomieLocalStorage();
    const config: ZoomieConfig = await storage.configLoad();
    updateCurrentProfile(currentProfileName, config.currentProfile.name);
  }
});

async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();
  AutoInit();

  updateCurrentProfile(currentProfileName, config.currentProfile.name);
  updateProfileSelect(profileSelectName, currentProfileName);


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
                },
              };
              storage.upsave(request);
            });
          });
        }
      }
    });
  };

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
                },
              };
              storage.load(request);
            });
          });
        }
      }
    });
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
                },
              };
              storage.load(request);
            });
          });
        }
      }
    });
  };

  const saveButton = document.getElementById("save_btn");
  if (saveButton !== null) {
    saveButton.addEventListener("click", saveClickCallback);
  }
  const loadButton = document.getElementById("load_btn");
  if (loadButton !== null) {
    loadButton.addEventListener("click", loadClickCallback);
  }
  const syncButton = document.getElementById("sync_btn");
  if (syncButton !== null) {
    syncButton.addEventListener("click", syncClickCallback);
  }
  const settingButton = document.getElementById("setting_btn");
  if (settingButton !== null) {
    settingButton.addEventListener("click", () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    });
  }
}

main();
