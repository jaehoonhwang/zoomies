import { ZoomieConfig, CONFIG } from './config';

/**
 * PSA: Chrome local storage is really weird.
 * When you store { "a": "b" }, you do storage.set({"a": "b"})
 * but when you retrieve you have to unpack it AGAIN.
 * storage.get(["a"]).then((item) => console.log("Key: " + item["a"])) 
 * Following will return B. 
 * This took me for a while to get it right. smh
 */

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

export interface ZoomieStorage {
  storage: chrome.storage.StorageArea;

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

  public static getStorageKey(display: string, url: string): string {
    return display + this.storageDelimieter + url;
  }

  public static getDisplayKey(display: ZoomieDisplay): string {
    if (display.height === undefined || display.width === undefined) {
      return "";
    }
    const displayKey: string = display.height + this.displayDelimiter + display.width;
    if (display.windowType === undefined) {
      return displayKey
    }

    return displayKey + this.displayTypeDelimieter + display.windowType;
  }
}

export class ZoomieLocalStorage implements ZoomieStorage {
  storage: chrome.storage.LocalStorageArea;

  public constructor() {
    this.storage = chrome.storage.local;
  }

  public async upsave(request: ZoomieStorageRequest): Promise<void> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(request.rawUrl);
    const displayKey: string = ZoomieConverter.getDisplayKey(request.display);
    const storageKey: string = ZoomieConverter.getStorageKey(displayKey, possibleKey);
    const profileKey: string = request.profileName;

    this.storage.get([profileKey], (zoomies) => {
      if (zoomies[profileKey] == undefined) {
        zoomies[profileKey] = {};
      }
      
      zoomies[profileKey][storageKey] = request.zoomLevel;
      this.storage.set({ [profileKey]: zoomies[profileKey] });
    });
  }

  public async load(request: ZoomieStorageRequest): Promise<Zoomie> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(request.rawUrl);
    const displayKey: string = ZoomieConverter.getDisplayKey(request.display);
    const storageKey: string = ZoomieConverter.getStorageKey(displayKey, possibleKey);
    const profileKey: string = request.profileName;

    const result = await this.storage.get([profileKey]);

    if (result[profileKey][storageKey] === undefined) {
      return { matchingUrl: possibleKey, zoomLevel: -1 }
    }

    const zoomLevel: number = result[profileKey][storageKey];
    const zoomie: Zoomie = {
      zoomLevel: zoomLevel,
      matchingUrl: possibleKey,
    };

    return zoomie;
  }

  public async configLoad(): Promise<ZoomieConfig> {
    const result = await this.storage.get([CONFIG]);
    return result[CONFIG];
  }

  public async configUpsave(newConfig: ZoomieConfig): Promise<void> {
    let config: ZoomieConfig = await this.configLoad();
    if (config === undefined) {
      config = newConfig;
    }

    this.storage.set({ [CONFIG]: config });
  }
}
