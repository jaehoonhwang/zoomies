import { ZoomieLocalStorage, ZoomieStorage, ZoomieConfig } from "../storage";

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}


async function main() {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();

  const saveClickCallback = () => {
    queryAllTabs().then((tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url != undefined) {
          chrome.tabs.getZoom(tab.id, function(zoomFactor: number) {
            storage.upsave(config.currentProfile, tab.url!, zoomFactor);
          });
        }
      }
    });
  }

  const loadClickCallback = () => {
    queryAllTabs().then((tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url !== undefined) {
          const Zoomies = storage.load(config.currentProfile, tab.url!);
          for (const zoomie in Zoomies) {
            console.log(zoomie);
          }
        }
      }
    });
  };

  const syncClickCallback = () => {
    queryAllTabs().then((tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url !== undefined) {
          storage.load(config.currentProfile, tab.url!)
            .then((zoomie) => chrome.tabs.setZoom(tab.id!, zoomie.zoomLevel));
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
