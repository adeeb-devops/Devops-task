import { Howl } from 'howler';

const sounds = {
  mine: new Howl({ src: ['/sounds/mine.mp3'] }),
  diamond: new Howl({ src: ['/sounds/diamond.mp3'] }),

};



export function playSound(name: string) {
//   const storedUser = retrieveEncryptedData("user");
//   const user = storedUser ? storedUser : null;
const user = localStorage.getItem('user');


  if (sounds[name]) {
    if (user) {
      // Parse the string into an object
      const userObject = JSON.parse(user);
      if(userObject.sound==true){
        sounds[name].play();

      }
    }
  } else {
    console.error(`Sound "${name}" not found or sound is disabled`);
  }
}

export const muteAllSounds = () => {
  Object.values(sounds).forEach(sound => sound.mute(true));
};

// Function to unmute all sounds
export const unmuteAllSounds = () => {
  Object.values(sounds).forEach(sound => sound.mute(false));

};

export function stopSound(name: string) {
  if (sounds[name]) {
    sounds[name].stop();
  } else {
    console.error(`Sound "${name}" not found`);
  }
}

export function stopAllSounds() {
  Object.keys(sounds).forEach(key => sounds[key].stop());
}
