import { ZoomieConfig, defaultConfig } from './config';

const CONFIG = "config";

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
  profileName?: string;
}

export interface ZoomieStorage {
  storage: chrome.storage.StorageArea;

  upsave: (request: ZoomieStorageRequest) => Promise<void>;
  load: (request: ZoomieStorageRequest) => Promise<Zoomie>;

  configUpsave: (key: string | null, value: string | null) => Promise<void>;
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

    await this.storage.set(
      {
        [storageKey]: {
          [displayKey]: {
            zoomLevel: request.zoomLevel,
          }
        }
      }
    );
  }

  public async load(request: ZoomieStorageRequest): Promise<Zoomie> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(request.rawUrl);
    const displayKey: string = ZoomieConverter.getDisplayKey(request.display);
    const storageKey: string = ZoomieConverter.getStorageKey(displayKey, possibleKey);

    const result = await this.storage.get([storageKey]);

    const zoomLevel: number = result[storageKey][displayKey];
    const zoomie: Zoomie = {
      zoomLevel: zoomLevel,
      matchingUrl: possibleKey,
    };

    console.log("LOAD", zoomie);
    return zoomie;
  }

  public async configLoad(): Promise<ZoomieConfig> {
    const result = await this.storage.get([CONFIG]);
    console.log(result);
    console.log(result[CONFIG]);
    return result[CONFIG];
  }

  public async configUpsave(key: string | null, value: string | null): Promise<void> {
    let config: ZoomieConfig = await this.configLoad();
    if (config === undefined) {
      config = defaultConfig;
    }

    if (key != undefined && value != undefined) {
      config[key] = value;
    }

    this.storage.set({ [CONFIG]: config });
  }
}
