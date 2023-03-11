import { ZoomieLocalStorage, ZoomieStorage } from "../storage";
import { AutoInit, FormSelect } from "materialize-css";

async function main() {
  AutoInit();
  const storage = new ZoomieLocalStorage();
  const config = await storage.configLoad();

  const currentProfile = config.currentProfile;

  const currentProfileElement = document.querySelector("#current_profile");
  if (currentProfileElement !== null) {
    currentProfileElement.textContent = currentProfile.name;
  }
}

main();
