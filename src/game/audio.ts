import { Howl } from "howler";

// In a real production game, you would place actual MP3/WAV files in the /public folder.
// Howler will gracefully fail to play if files are missing, without crashing the app.
export const sounds = {
  jump: new Howl({ src: ["/sounds/jump.mp3"], volume: 0.5 }),
  collect: new Howl({ src: ["/sounds/collect.mp3"], volume: 0.6 }),
  hit: new Howl({ src: ["/sounds/hit.mp3"], volume: 0.8 }),
  eraShift: new Howl({ src: ["/sounds/erashift.mp3"], volume: 0.7 }),
  bgm: new Howl({
    src: ["/sounds/bgm.mp3"],
    volume: 0.3,
    loop: true,
  }),
};

export const playSound = (soundName: keyof typeof sounds) => {
  sounds[soundName].play();
};

export const stopBgm = () => {
  sounds.bgm.stop();
};

export const playBgm = () => {
  if (!sounds.bgm.playing()) {
    sounds.bgm.play();
  }
};
