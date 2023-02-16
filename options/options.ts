import { ZoomieLocalStorage, ZoomieStorage } from "../storage";

async function main() {
  const storage = new ZoomieLocalStorage();
  const config = await storage.configLoad();

  const currentProfile = config.currentProfile;

  const currentProfileElement = document.querySelector("#current_profile");
  if (currentProfileElement !== null) {
    currentProfileElement.textContent = currentProfile.name;
  }
}

main();
