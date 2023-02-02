export interface Zoomie {
  zoomLevel: number;
  matchingUrl: string;
  profile?: string;
  rawUrl?: string;
}

export interface ZoomieStorage {
  storage: chrome.storage.StorageArea;

  upsave: (profile: string, rawUrl: string, zoomLevel: number) => void;
  load: (profile: string, rawUrl: string) => Zoomie;
}

class ZoomieStorageConstants {
  public static readonly depth = 2;
}

export class ZoomieConverter {
  public static readonly keyDelimiter: string = "|";
  public static readonly pathDelimiter: string = "/";

  /*
   * Zoomie keys are constructed: profile.rawUrl
   * It will try to get all possible Urls for key.
   * Example:
   *  profile: default & rawUrl: https://example.com/example2/index.html
   *  then it will return
   *    [
   *      example.com/example2/index.html,
   *      example.com/example2,
   *      example.com,
   *    ]
   */
  public static getZoomieKey(rawUrl: string): string[] {
    let url: URL = new URL(rawUrl);
    let paths: string[] = url.pathname.split(this.pathDelimiter);
    let possibleKeys: string[] = [url.hostname];
    let pathnameHolder: string = url.hostname;

    for (let path in paths) {
      pathnameHolder += this.pathDelimiter + path;
      possibleKeys.push(pathnameHolder);
    }

    possibleKeys.push(rawUrl);
    return possibleKeys.reverse();
  }
}

export class ZoomieLocalStorage implements ZoomieStorage {
  storage: chrome.storage.LocalStorageArea;

  public constructor() {
    this.storage = chrome.storage.local;
  }

  public upsave(profile: string, rawUrl: string, zoomLevel: number): void {
    let possibleKeys: string[] = ZoomieConverter.getZoomieKey(rawUrl);
    let saveKeys: string[] = possibleKeys.length < ZoomieStorageConstants.depth
      ? possibleKeys : possibleKeys.slice(0, ZoomieStorageConstants.depth);
    for (let key in saveKeys) {
      this.storage.get([key]).then(
        (result) => {
          if (result == undefined) {
            result = {
              profile: zoomLevel,
            }
          } else if (!result.hasOwnProperty(profile)) {
            result[profile] = zoomLevel;
          }
          this.storage.set({ key: result });
        });
    }

    let storageGetPromises: any = [];
    for (let key in possibleKeys) {
      storageGetPromises.push(this.storage.get([key]).then(
        (results) => {
          return { key: key, results: results, }
        }
      ));
    }

    Promise.all(storageGetPromises).then(
      (zoomInfoLite) => {

        return;
      });
  }

  public load(profile: string, rawUrl: string): Zoomie {
    let possibleKeys: string[] = ZoomieConverter.getZoomieKey(rawUrl);
    for (let key in possibleKeys) {
      this.storage.get([key]).then(
        (result) => {
        });
    }
    return { zoomLevel: 1, profile: "default", matchingUrl: "dank" };
  }
}
