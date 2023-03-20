import { ZoomieConfig, CONFIG } from "./config";

/**
 * PSA: Chrome local storage is really weird.
 * When you store { "a": "b" }, you do storage.set({"a": "b"})
 * but when you retrieve you have to unpack it AGAIN.
 * storage.get(["a"]).then((item) => console.log("Key: " + item["a"]))
 * Following will return B.
 * This took me for a while to get it right. smh
 */

const UNDEFINED_ZOOM_LEVEL = -1;

export interface Zoomie {
  zoomLevel: number;
  matchingUrl: string;
}

export interface ZoomieDisplay {
  height?: number;
  width?: number;
  windowType?: chrome.windows.windowTypeEnum;
}

export interface ZoomieStorageRequest {
  display: ZoomieDisplay;
  zoomLevel: number;
  rawUrl: string;
  profileName: string;
}

export function buildStorageRequest(
  window: chrome.windows.Window,
  profileName: string,
  tab: chrome.tabs.Tab,
  zoomLevel: number
): ZoomieStorageRequest {
  return {
    zoomLevel: zoomLevel,
    profileName: profileName,
    display: {
      width: window.width,
      height: window.height,
    },
    rawUrl: tab.url!,
  };
}

export function buildStorageRequestWithNoZoom(
  window: chrome.windows.Window,
  profileName: string,
  tab: chrome.tabs.Tab
): ZoomieStorageRequest {
  return buildStorageRequest(window, profileName, tab, UNDEFINED_ZOOM_LEVEL);
}

/**
 * Storage should work like following:
 * "www.example.com": {
 *   "exampleProfileName": {
 *     "1234x1234.popup": 1.5,
 *   },
 *   "exampleProfileName2": {
 *     "1234x1234.popup": 2,
 *   }
 * }
 */
export interface ZoomieStorage {
  storage: chrome.storage.StorageArea;
  settingStorage: chrome.storage.StorageArea;

  upsave: (request: ZoomieStorageRequest) => Promise<void>;
  load: (request: ZoomieStorageRequest) => Promise<Zoomie>;

  configUpsave: (config: ZoomieConfig) => Promise<void>;
  configLoad: () => Promise<ZoomieConfig>;
}

export class ZoomieConverter {
  public static readonly storageDelimieter: string = "#";
  public static readonly displayDelimiter: string = "x";
  public static readonly displayTypeDelimieter: string = ".";

  public static getZoomieKey(urlString: string): string {
    const url: URL = new URL(urlString);

    return url.hostname + url.pathname;
  }

  public static getDisplayKey(display: ZoomieDisplay): string {
    if (display.height === undefined || display.width === undefined) {
      return "";
    }
    const displayKey: string =
      display.height + this.displayDelimiter + display.width;
    if (display.windowType === undefined) {
      return displayKey;
    }

    return displayKey + this.displayTypeDelimieter + display.windowType;
  }
}

export class ZoomieLocalStorage implements ZoomieStorage {
  storage: chrome.storage.LocalStorageArea;
  settingStorage: chrome.storage.SyncStorageArea;

  public constructor() {
    this.storage = chrome.storage.local;
    this.settingStorage = chrome.storage.sync;
  }

  public async upsave(request: ZoomieStorageRequest): Promise<void> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(request.rawUrl);
    const displayKey: string = ZoomieConverter.getDisplayKey(request.display);
    const profileKey: string = request.profileName;

    this.storage.get([possibleKey], (zoomies) => {
      if (zoomies[possibleKey] === undefined) {
        zoomies[possibleKey] = {};
      }

      if (zoomies[possibleKey][profileKey] === undefined) {
        zoomies[possibleKey][profileKey] = {};
      }

      zoomies[possibleKey][profileKey][displayKey] = request.zoomLevel;
      this.storage.set({ [possibleKey]: zoomies[possibleKey] });
    });
  }

  public async load(request: ZoomieStorageRequest): Promise<Zoomie> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(request.rawUrl);
    const displayKey: string = ZoomieConverter.getDisplayKey(request.display);
    const profileKey: string = request.profileName;

    const result = await this.storage.get([possibleKey]);

    if (
      result[possibleKey] === undefined ||
      result[possibleKey][profileKey] === undefined ||
      result[possibleKey][profileKey][displayKey] === undefined
    ) {
      return { matchingUrl: possibleKey, zoomLevel: -1 };
    }

    const zoomLevel: number = result[possibleKey][profileKey][displayKey];
    const zoomie: Zoomie = {
      zoomLevel: zoomLevel,
      matchingUrl: possibleKey,
    };

    return zoomie;
  }

  public async configLoad(): Promise<ZoomieConfig> {
    const result = await this.settingStorage.get([CONFIG]);
    return result[CONFIG];
  }

  public async configUpsave(newConfig: ZoomieConfig): Promise<void> {
    if (newConfig == undefined) {
      newConfig = await this.configLoad();
    }

    this.settingStorage.set({ [CONFIG]: newConfig });
  }
}
