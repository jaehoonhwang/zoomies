import {
  ZoomieLocalStorage,
  ZoomieStorage,
  ZoomieStorageRequest,
} from "../storage";
import { ZoomieProfile } from "../config";
import { updateCurrentProfile, updateProfileSelect, saveProfileElement } from "../custom/custom";
import { AutoInit, updateTextFields } from "materialize-css";
import { ZoomieConfig, CONFIG } from "../config";

const profileSelectName = "#profileSelections";
const currentProfileName = "#current_profile";

const nameProfileForm = "#select_profile_name";
const displaySizeProfileForm = "#profile_display_size";
const descriptionProfileForm = "#profile_description";
const saveButtonElementName = "#form-submit";

chrome.storage.onChanged.addListener(async function(changes, namespace) {
  if (CONFIG in changes) {
    const storage: ZoomieStorage = new ZoomieLocalStorage();
    const config: ZoomieConfig = await storage.configLoad();
    updateCurrentProfile(currentProfileName, config.currentProfile.name);
    updateFormValues(config.currentProfile);
    AutoInit();
  }
});

function convertFormToConfig(): ZoomieProfile {
  const profileName = getValueIfNotEmpty(nameProfileForm);
  const displaySize = getValueIfNotEmpty(displaySizeProfileForm);
  const description = getValueIfNotEmpty(descriptionProfileForm);

  return {
    name: profileName,
    description: description,
    displaySize: displaySize,
  }
}

function getValueIfNotEmpty(id: string): string {
  const elem = document.querySelector(id);
  console.log("getValue id: " + id + elem?.nodeValue);
  if (elem !== null) {
    return elem.nodeValue == null ? "" : elem.nodeValue;
  }
  return "";
}

function updateValueIfNotNull(id: string, value: string | undefined) {
  const elem = document.querySelector(id);
  console.log("updateValue id: " + id + ", with: " + value);
  if (elem !== null) {
    value = value == undefined ? "" : value;
    elem.setAttribute("value", value);
  }
}


function updateFormValues(currentProfile: ZoomieProfile) {
  updateValueIfNotNull(nameProfileForm, currentProfile.name);
  updateValueIfNotNull(displaySizeProfileForm, currentProfile.displaySize);
  updateValueIfNotNull(descriptionProfileForm, currentProfile.description);

  updateTextFields(); // Reload label text.
}

const saveProfileCallback = async function () {
  const storage = new ZoomieLocalStorage();
  const config = await storage.configLoad();
  config.currentProfile = convertFormToConfig();

  storage.configUpsave(config);
}

async function main() {
  AutoInit();
  const storage = new ZoomieLocalStorage();
  const config = await storage.configLoad();
  const currentProfile = config.currentProfile;

  updateCurrentProfile(currentProfileName, currentProfile.name);
  updateProfileSelect(profileSelectName, currentProfileName);

  updateFormValues(currentProfile);
  saveProfileElement(saveButtonElementName, saveProfileCallback);
}

main();
