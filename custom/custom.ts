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

export async function updateCurrentProfile(labelId: string, profileName: string) {
  const profile = document.querySelector(labelId);
  if (profile !== null) {
    profile.textContent = profileName;
  }
}

/**
 * Only accepts HTML ID class (kinda hardcoded)
 */
export async function updateProfileSelect(id: string, labelId: string) {
  const storage: ZoomieStorage = new ZoomieLocalStorage();
  const config: ZoomieConfig = await storage.configLoad();

  const profileSelectElement = document.querySelector(id);
  if (profileSelectElement !== null) {
    let unseen = config.profiles.map((p) => p.name);
    const selectElements: Array<Element> = [];
    const defaultProfileName = config.currentProfile.name;

    const defaultSelect = document.createElement("option");
    defaultSelect.setAttribute("value", "");
    defaultSelect.setAttribute("class", "selected");
    defaultSelect.textContent = defaultProfileName;
    profileSelectElement.appendChild(defaultSelect);
    selectElements.push(defaultSelect);

    unseen = unseen.filter((a) => a != defaultProfileName);
    let value = 1;
    for (const name of unseen) {
      const selectChild = document.createElement("option");
      selectChild.textContent = name;
      selectChild.setAttribute("value", String(value));
      profileSelectElement.appendChild(selectChild);
      selectElements.push(selectChild);
      value += 1;
    }

    profileSelectElement.addEventListener("change", (event) => {
      if (event.target === null || !("value" in event.target)) {
        return;
      }
      const selectedProfile = Number(event.target.value);
      const result = config.profiles[selectedProfile];
      if (result !== undefined) {
        config.currentProfile = result;
        storage.configUpsave(config);
        updateCurrentProfile(labelId, result.name);
      }
      const elems = document.querySelectorAll(id);
      FormSelect.init(elems, {});
    });

    const elems = document.querySelectorAll(id);
    FormSelect.init(elems, {});
  }
}

export function saveProfileElement(saveButtonElementName: string, fn: any) {
  const saveButton = document.querySelector(saveButtonElementName);
  console.log(saveButton);
  if (saveButton !== null) {
    saveButton.addEventListener("click", fn);
  }
}
