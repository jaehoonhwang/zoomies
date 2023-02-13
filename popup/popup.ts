import {
  ZoomieLocalStorage,
  ZoomieStorage,
  ZoomieStorageRequest,
} from "../storage";
import { ZoomieConfig, CONFIG } from "../config";
import { AutoInit, FormSelect } from "materialize-css";

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

async function updateCurrentProfile(profileName: string) {
  const profile = document.querySelector("#current_profile");
  if (profile !== null) {
    profile.textContent = profileName;
  }
}

chrome.storage.onChanged.addListener(async function(changes, namespace) {
  if (CONFIG in changes) {
    const storage: ZoomieStorage = new ZoomieLocalStorage();
    const config: ZoomieConfig = await storage.configLoad();
    updateCurrentProfile(config.currentProfile.name);
  }
});

async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();
  AutoInit();

  updateCurrentProfile(config.currentProfile.name);


  const profileSelect = document.querySelector('#profileSelections');
  if (profileSelect !== null) {
    let unseen = config.profiles.map(p => p.name);
    const selectElements: Array<Element> = [];
    const defaultProfileName = config.currentProfile.name;

    const defaultSelect = document.createElement("option");
    defaultSelect.setAttribute("value", "");
    defaultSelect.setAttribute("class", "selected");
    defaultSelect.textContent = defaultProfileName;
    profileSelect.appendChild(defaultSelect);
    selectElements.push(defaultSelect);

    unseen = unseen.filter(a => a != defaultProfileName);
    let value = 1;
    for (const name of unseen) {
      const selectChild = document.createElement("option");
      selectChild.textContent = name;
      selectChild.setAttribute("value", String(value));
      profileSelect.appendChild(selectChild);
      selectElements.push(selectChild);
      value += 1;
    }

    profileSelect.addEventListener("change", (event) => {
      if (event.target === null || !("value" in event.target)) {
        return;
      }
      const selectedProfile = Number(event.target.value);
      const result = config.profiles[selectedProfile];
      if (result !== undefined) {
        config.currentProfile = result;
        storage.configUpsave(config);
        updateCurrentProfile(result.name);
      }

    });

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
