import { ZoomieStorageRequest } from "./storage";
import { ZoomieConfig } from "./config";

export interface ZoomieTabRequest {
  config: ZoomieConfig;
}

function queryAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

export default async function saveZoom(request: ZoomieTabRequest) {
  console.log("Save Zoomers");
}

/**
  * check tab for defined url and id for tab.
  */
function checkTab(tab: chrome.tabs.Tab): boolean {
  return tab.id != undefined && tab.url != undefined;
}
