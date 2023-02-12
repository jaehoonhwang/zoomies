import {
  ZoomieLocalStorage,
  ZoomieStorage,
  ZoomieStorageRequest,
} from "../storage";
import { ZoomieConfig } from "../config";
import { AutoInit, FormSelect } from "materialize-css";

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();
  AutoInit();

  const profile = document.querySelector("#current_profile");
  if (profile !== null) {
    profile.textContent = config.currentProfile.name;
  }

  const profileSelect = document.querySelector('#profileSelections');
  if (profileSelect !== null) {
    let unseen = config.profiles.map(p => p.name);
    console.log(unseen);
    const defaultProfileName = config.currentProfile.name;

    const defaultSelect = document.createElement("option");
    defaultSelect.setAttribute("value", "");
    defaultSelect.setAttribute("class", "selected");
    defaultSelect.textContent = defaultProfileName;
    profileSelect.appendChild(defaultSelect);

    unseen = unseen.filter(a => a != defaultProfileName);
    console.log(unseen);
    let value = 1;
    for (const name of unseen) {
      const selectChild = document.createElement("option");
      selectChild.textContent = name;
      selectChild.setAttribute("value", String(value));
      profileSelect.appendChild(selectChild);
      value += 1;
    }

    const elems = document.querySelectorAll('#profileSelections');
    FormSelect.init(elems, {});
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
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
  }
}

main();
