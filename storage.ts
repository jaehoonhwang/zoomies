const CONFIG = "config";

export interface Zoomie {
  zoomLevel: number;
  matchingUrl: string;
  profile?: string;
  rawUrl?: string;
}

export interface ZoomieConfig {
  currentProfile: string;
  profiles: string[];

  [key: string]: string | string[];
}

export interface ZoomieStorage {
  storage: chrome.storage.StorageArea;

  upsave: (profile: string, rawUrl: string, zoomLevel: number) => Promise<void>;
  load: (profile: string, rawUrl: string) => Promise<Zoomie>;

  configUpsave: (key: string | null, value: string | null) => Promise<void>;
  configLoad: () => Promise<ZoomieConfig>;
}

export interface ZoomieConfigStorage {
  storage: chrome.storage.StorageArea;

  upsave: (key: string, value: string) => Promise<void>;
  load: (key: string) => Promise<Zoomie>;
}

const defaultConfig: ZoomieConfig = {
  currentProfile: "default",
  profiles: ["default"],
};


export class ZoomieConverter {
  public static readonly storageDelimieter: string = "#";

  public static getZoomieKey(rawUrl: string): string {
    const url: URL = new URL(rawUrl);

    return url.hostname + url.pathname;
  }

  public static getStorageKey(profile: string, url: string): string {
    return profile + this.storageDelimieter + url;
  }
}

export class ZoomieLocalStorage implements ZoomieStorage {
  storage: chrome.storage.LocalStorageArea;

  public constructor() {
    this.storage = chrome.storage.local;
  }

  public async upsave(profile: string, rawUrl: string, zoomLevel: number): Promise<void> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(rawUrl);
    const storageKey: string = ZoomieConverter.getStorageKey(profile, possibleKey);

    await this.storage.set(
      {
        [storageKey]: zoomLevel,
      }
    );
  }

  public async load(profile: string, rawUrl: string): Promise<Zoomie> {
    const possibleKey: string = ZoomieConverter.getZoomieKey(rawUrl);
    const storageKey: string = ZoomieConverter.getStorageKey(profile, possibleKey);

    const result = await this.storage.get([storageKey]);
    const zoomLevel: number = result[storageKey];
    const zoomie: Zoomie = {
      zoomLevel: zoomLevel,
      matchingUrl: possibleKey,
    };

    console.log("LOAD", zoomie);
    return zoomie;
  }

  public async configLoad(): Promise<ZoomieConfig> {
    const result = await this.storage.get([CONFIG]);
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
