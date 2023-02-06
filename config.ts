// TODO(jaehoonh): Migrate the code to use this file instead of living inside
// of storage.ts

export const CONFIG = "config";

const configAdjectives = [
  "cunning",
  "subtle",
  "slick",
  "deceptive",
  "foxy",
  "crafty",
  "artful",
  "fraudulent",
  "tricky",
  "dishonest",
];

const configAnimals = [
  "dog",
  "cat",
  "alpaca",
  "elephant",
  "giraffe",
  "tortoise",
  "lion",
  "puma",
  "hedgehog",
  "sloth",
]

export function generateProfileName(): string {
  const adjectivesLength = configAdjectives.length;
  const animalLength = configAnimals.length;
  const adjectiveIndex = Math.floor(Math.random() * adjectivesLength);
  const animalIndex = Math.floor(Math.random() * animalLength);

  return configAdjectives[adjectiveIndex] + configAnimals[animalIndex];
}

export interface ZoomieConfig {
  currentProfile: ZoomieProfile;
  profiles: ZoomieProfile[];

  [key: string]: string | string[] | ZoomieProfile | ZoomieProfile[];
}

export interface ZoomieProfile {
  name: string;
  displaySize?: string;
  description: string;
}

const defaultProfile: ZoomieProfile = {
  name: "AmbiguousSloth",
  description: "Default one created when installed",
  displaySize: undefined,
}

const defaultConfig: ZoomieConfig = {
  currentProfile: defaultProfile,
  profiles: [defaultProfile],
};
