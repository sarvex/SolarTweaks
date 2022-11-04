<template>
  <div>
    <div
      id="play-container"
      :style="'height: ' + $store.getters.getPlayContainerHeight + 'px'"
    >
      <div id="buttons" :class="{ disabled: $store.state.isLaunching }">
        <button
          id="play-button"
          @click="launchGame()"
          :disabled="$store.state.isLaunching"
        >
          <span id="play-btn-title">{{
            $store.state.launchingState.title
          }}</span
          ><br />
          <i class="play-btn-icon" :class="$store.state.launchingState.icon"></i
          ><span id="play-btn-subtitle">{{
            $store.state.launchingState.message
          }}</span>
        </button>
        <button
          id="change-version-button"
          @click="toggleSelectingMenu()"
          :disabled="$store.state.isLaunching"
        >
          <i class="fa-solid fa-angle-down play-btn-icon"></i>
        </button>
      </div>
      <div id="select-version-container" v-if="isSelectingVersion">
        <div
          id="select-version-container-background"
          @click="saveChanges()"
        ></div>
        <div id="select-version-grid-container">
          <h5 id="select-version-subtitle">
            <i>SELECT A VERSION TO CHOOSE A NEW DEFAULT</i>
          </h5>
          <div id="select-version-grid">
            <div
              class="select-version-card"
              v-for="availableVersion in availableVersions"
              v-bind:key="availableVersion.version"
              @click="selectVersion(availableVersion.version)"
            >
              <div class="select-version-card-inner-container">
                <div
                  class="select-version-card-inner-foreground"
                  :style="`background: url('${
                    availableVersion.foreground
                  }'); background-size: cover; ${
                    selectedVersion.version === availableVersion.version
                      ? 'filter: saturate(1) brightness(1);'
                      : ''
                  }`"
                ></div>
                <h3 class="select-version-card-title">
                  Version {{ availableVersion.version }}
                </h3>
                <div
                  className="select-version-card-inner-background"
                  :style="`background: url('${
                    availableVersion.background
                  }'); background-size: cover; ${
                    selectedVersion.version === availableVersion.version
                      ? 'filter: saturate(1) brightness(1);'
                      : ''
                  }`"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div id="select-version-info">
          <h2 id="select-version-info-title">LAUNCH OPTIONS</h2>
          <div class="select-version-display">
            <div
              className="select-version-display-foreground"
              :style="`background: url('${selectedVersion.foreground}'); background-size: cover;`"
            ></div>
            <h3 class="select-version-display-title">
              Version {{ selectedVersion.version }}
            </h3>
            <div
              className="select-version-display-background"
              :style="`background: url('${selectedVersion.background}'); background-size: cover;`"
            ></div>
          </div>
          <div class="select-version-info-description">
            <p>
              {{ selectedVersion.description }}
            </p>
          </div>
          <div className="select-version-options">
            <div class="select-version-modules">
              <h4>MODULES:</h4>
              <button
                v-for="versionModule in selectedVersion.modules"
                v-bind:key="versionModule"
                @click="setModule(versionModule)"
                :class="
                  selectedModule === versionModule ? 'selected-module' : ''
                "
                class="select-version-module"
                :style="`background: url('${
                  versionModule === 'neu'
                    ? 'https://launcherimages.lunarclientcdn.com/modules/forge.e777793528.webp'
                    : versionModule === 'sodium'
                    ? 'https://launcherimages.lunarclientcdn.com/modules/sodium.7ca9f606bb.webp'
                    : 'https://launcherimages.lunarclientcdn.com/modules/optifine.756973b7aa.webp'
                }'); background-size: cover; background-position: center;`"
              ></button>
            </div>
            <button class="select-version-revert" @click="revertChanges()">
              <i class="fa-solid fa-rotate"></i>
              <p>REVERT CHANGES</p>
            </button>
            <button class="select-version-save" @click="saveChanges()">
              <i class="fa-solid fa-circle-arrow-right"></i>
              <p>SAVE OPTIONS</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import settings from 'electron-settings';
import { checkAndLaunch } from '../../javascript/minecraft';
import Logger from '../../javascript/logger';
import { updateActivity } from '../../javascript/discord';
const logger = new Logger('play');
export default {
  name: 'Play',
  data: () => ({
    isSelectingVersion: false,
    isLaunching: false,
    selectedVersion: {},
    /** @type {"lunar" | "neu" | "sodium"} */
    selectedModule: 'lunar',
    availableVersions: [
      {
        version: '1.8.9',
        background: 'https://i.imgur.com/u6qTOH9.png',
        foreground: 'https://i.imgur.com/es44Sho.png',
        description:
          'The "Bountiful Update" is the name given to the release of version 1.8 on September 2nd, 2014. This update includes many new features such as a unique underwater dungeon, new mobs such as endermites, guardians, elder guardians, and rabbits. This update also included the introduction of armour stands and many enhancements to skins, such as the Alex model and jacket layers.',
        modules: ['lunar', 'neu'],
      },
      {
        version: '1.19.2',
        background: 'https://i.imgur.com/lRRqoDK.png',
        foreground: 'https://i.imgur.com/MmitAPb.png',
        description:
          'The “Wild Update” is the name given to the release of version 1.19 on June 7th, 2022. The update introduces a variety of new content including: brand-new locations, materials, and blocks such as the Deep Dark and Mangrove biomes; ancient cities; mobs like the warden, the frog, the tadpole, and the allay, as well as new items obtainable only in these new biomes.',
        modules: ['lunar', 'sodium'],
      },
      {
        version: '1.18.2',
        background: 'https://i.imgur.com/5QVfAG0.png',
        foreground: 'https://i.imgur.com/aCcvU1q.png',
        description:
          'The "Caves & Cliffs: Part II Update" is the name given to the release of version 1.18 on November 30th, 2021. This update finalized the overhaul of the overworld generation started in "Part I", with enormous caves, taller mountains, and many new biomes. This update also changed the height and depth of the world, allowing for some spectacular mountains and vast cave systems.',
        modules: ['lunar', 'sodium'],
      },
      {
        version: '1.17.1',
        background: 'https://i.imgur.com/OOYEz3b.png',
        foreground: 'https://i.imgur.com/SaTzqRL.png',
        description:
          'The "Caves & Cliffs: Part I Update" is the name given to the release of version 1.17 on June 8th, 2021. This update started with changes made in world generation such as mountains, caves, ore veins, mineshafts, and strongholds. It also introduced many new biomes and mobs. These mobs include goats, axolotls, and the community-voted glow squid! The biome additions include Dripstone Caves, Lush Caves, and six new sub-biomes.',
        modules: ['lunar', 'sodium'],
      },
      {
        version: '1.16.5',
        background: 'https://i.imgur.com/MgD3ci9.png',
        foreground: 'https://i.imgur.com/aAlHMJy.png',
        description:
          'The "Nether Update" is the name given to the release of version 1.16 on June 23rd, 2020. Hence the name; this update changed many things about the Nether, including new biomes, new mobs, and generated structures. The new biomes include Crimson and Warped Forests, Soul Sand Valley, and Basalt Deltas. The new mobs include the Piglin, Strider, Zoglin, Hoglin, and Piglin Brute.',
        modules: ['lunar', 'sodium'],
      },
      {
        version: '1.12.2',
        background: 'https://i.imgur.com/tDusCZE.png',
        foreground: 'https://i.imgur.com/D60vmlt.png',
        description:
          'The "World of Color Update" is the name given to the release of version 1.12 on June 7th, 2017. This update includes many new features such as new coloured blocks with an enhanced pallet, parrots, the introduction of the recipe book in the inventory, a Narrator mode that says what is typed in chat out loud, new sounds, and much more!',
        modules: ['lunar'],
      },
      {
        version: '1.7.10',
        background: 'https://i.imgur.com/mLPaMiE.png',
        foreground: 'https://i.imgur.com/aYrxI77.png',
        description:
          '"The Update that Changed the World" is the name given to the release of version 1.7 on October 25th, 2013. This update includes many new features such as a new terrain generator, many new biomes and biome variations, new tree types, many new flowers, red sand, stained glass, and much more!',
        modules: ['lunar'],
      },
    ],
  }),
  methods: {
    /**
     * Launch the game
     */
    async launchGame() {
      await checkAndLaunch().catch((error) => {
        logger.throw('Failed to Launch Game', error);
        updateActivity('In the launcher');
      });
    },
    /**
     * Set new version as default
     * @param {string} version The version
     */
    async selectVersion(version) {
      await this.updateSelectedVersion(version);
      if (!this.selectedVersion.modules.includes(this.selectedModule))
        this.setModule(this.selectedVersion.modules[0]);
    },
    /**
     * Update the button title, message and icon
     */
    async updateLaunchButton() {
      const version = await settings.get('version');
      if (!version) return setTimeout(() => this.updateLaunchButton(), 150);
      this.$store.commit('setLaunchingState', {
        title: `LAUNCH ${version}`,
        message: 'READY TO LAUNCH',
        icon: 'fa-solid fa-gamepad',
      });
    },
    /**
     * Update the selected version
     * @param {string} version The version
     */
    async updateSelectedVersion(version) {
      if (!version) version = await settings.get('version');
      this.selectedVersion =
        this.availableVersions.find((i) => i.version === version) ?? {};
    },
    /**
     * Toggle the Version Selecting Menu
     */
    async toggleSelectingMenu() {
      await this.updateSelectedVersion();
      this.isSelectingVersion = !this.isSelectingVersion;
    },
    /**
     * Change the Version Module currently being used
     * @param {"lunar" | "neu" | "sodium"} module
     */
    setModule(module = 'lunar') {
      this.selectedModule = module;
    },
    async revertChanges() {
      this.setModule(await settings.get('module'));
      await this.toggleSelectingMenu();
    },
    async saveChanges() {
      await settings.set('version', this.selectedVersion.version);
      await settings.set('module', this.selectedModule);
      await this.updateLaunchButton();
      await this.toggleSelectingMenu();
    },
  },
  async mounted() {
    // Timeout because when first launch there is no version set
    setTimeout(async () => {
      await this.updateLaunchButton();
      await this.updateSelectedVersion();
      this.setModule(await settings.get('module'));
    }, 150);
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 7px;
  display: flex;
}

::-webkit-scrollbar-thumb {
  height: 50px;
  border-radius: 90px;
  background-color: #424140;
}

#play-container {
  width: 100%;
  height: 300px;
  margin-top: 110px;
  background: url('https://i.ibb.co/dkPrF69/background-images.png') no-repeat
    center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height 0.5s ease-in-out;
}

#buttons {
  box-shadow: 0 0 25px -5px #28af55;
  transition: box-shadow 0.5s ease, transform 0.5s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-transform: perspective(1px) scale3d(1, 1, 1);
  transform: perspective(1px) scale3d(1, 1, 1);
}

#buttons:hover {
  box-shadow: 0 0 40px -5px #28af55;
  -webkit-transform: perspective(1px) scale3d(1.15, 1.15, 1.05);
  transform: perspective(1px) scale3d(1.05, 1.05, 1.05);
}

#play-button {
  box-shadow: 0 0 25px -5px #28af55;
  background-color: #28af55d9;
  border: none;
  width: 315px;
  height: 70px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  transition: background-color 0.5s ease;
  cursor: pointer;
  text-shadow: 0 0.1rem 0 rgba(0, 0, 0, 0.3);
}

#play-button:hover {
  background-color: #33d168d9;
  text-shadow: 0 0.1rem 0 rgba(0, 0, 0, 0.3);
}

#buttons.disabled {
  box-shadow: 0 0 25px -5px purple;
}

#buttons.disabled:hover {
  box-shadow: 0 0 40px -5px purple;
}

#play-button:disabled {
  background-color: rgba(128, 0, 128, 0.85);
  box-shadow: 0 0 40px -5px #800080;
  cursor: default;
  width: 355px;
  border-radius: 10px;
}

#change-version-button {
  box-shadow: 0 0 25px -5px #28af55;
  background-color: #28af55d9;
  border: none;
  width: 40px;
  height: 70px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: background-color 0.5s ease;
  cursor: pointer;
}

#change-version-button:hover {
  background-color: #33d168d9;
}

#change-version-button:disabled {
  display: none;
}

#play-btn-title {
  font-size: x-large;
  font-weight: 700;
  letter-spacing: 2.5px;
  line-height: 1.2;
}

.play-btn-icon {
  margin-right: 8px;
}

#play-btn-subtitle {
  font-size: 0.775rem;
  font-weight: 400;
  letter-spacing: 3px;
  line-height: 1.2;
}

#select-version-container {
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  gap: 30px;
  padding-top: 12.5%;
  justify-content: center;
  z-index: 2;
  overflow-y: hidden;
  text-align: center;
  background-color: #000000d6;
}

#select-version-container-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

#select-version-subtitle {
  letter-spacing: 2px;
  font-weight: 400;
  margin-top: 5px;
}

#select-version-grid {
  margin: 15px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  width: 700px;
  height: 500px;
  grid-column-gap: 5px;
  grid-row-gap: 25px;
  overflow-y: scroll;
  padding-right: 0px;
  text-align: center;
}

.select-version-card {
  width: 340px;
  height: 145px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  backface-visibility: hidden;
}

.select-version-card-inner-container {
  display: flex;
  align-content: center;
  justify-content: center;
  width: 340px;
  height: 145px;
  transform: perspective(1px) scale(1.05);
  -webkit-transform: perspective(1px) scale(1.05);
  text-shadow: 0 2px 0 rgb(0, 0, 0, 0.2);
  transition: 0.5s ease;
  font-smoothing: subpixel-antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
}

.select-version-card-inner-container:hover {
  transform: perspective(1px) scale(1.15);
  -webkit-transform: perspective(1px) scale(1.15);
}

.select-version-card-inner-foreground {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
  filter: saturate(0) brightness(1);
  transition: 0.5s ease;
}

.select-version-card-inner-container:hover
  .select-version-card-inner-foreground {
  filter: saturate(1) brightness(1);
}

.select-version-card-title {
  position: absolute;
  font-family: 'Panton';
  font-size: 37px;
  letter-spacing: 1px;
  margin-top: 50px;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
  z-index: 1;
  font-smoothing: subpixel-antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
}

.select-version-card-inner-background {
  filter: saturate(0) brightness(0.9);
  height: 100%;
  width: 100%;
  transition: 0.5s ease;
}

/*
.select-version-card-inner-container:hover
  .select-version-card-inner-background {
  filter: saturate(1) brightness(0.5);
} */

.select-version-info {
  display: flex;
}

#select-version-info-title {
  letter-spacing: 2px;
  font-weight: 600;
  font-size: 25px;
}

.select-version-display {
  margin-top: 5px;
  display: flex;
  position: relative;
  width: 500px;
  height: 220px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
}

.select-version-display-foreground {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
}

.select-version-display-title {
  position: absolute;
  font-family: 'Panton';
  font-size: 55px;
  letter-spacing: 1px;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
  z-index: 1;
  font-smoothing: subpixel-antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
}

.select-version-display-background {
  height: 100%;
  width: 100%;
}

.select-version-info-description {
  margin-top: 15px;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  width: 500px;
  text-align: left;
}

.select-version-modules {
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 1;
}

.select-version-options {
  margin-top: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.select-version-modules h4 {
  font-style: italic;
  letter-spacing: 2px;
  font-size: 0.8rem;
}

.select-version-module {
  width: 37px;
  height: 37px;
  outline: none;
  border: none;
  border-radius: 999rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.select-version-modules .selected-module {
  box-shadow: 0 0 0 3px white;
}

.select-version-save {
  display: flex;
  flex-direction: row;
  background: #2b71ce;
  border: none;
  padding: 5px 5px;
  border-radius: 5px;
  text-shadow: 0 2px 0 #00000080;
  font-weight: 500;
  letter-spacing: 0.2px;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  position: absolute;
  right: 3.5%;
  margin-top: 2.5px;
}

.select-version-save:hover {
  background: #2562b1;
}

.select-version-revert {
  display: flex;
  flex-direction: row;
  background: #dd3e3e;
  border: none;
  padding: 5px 5px;
  border-radius: 5px;
  text-shadow: 0 2px 0 #00000080;
  font-weight: 500;
  letter-spacing: 0.2px;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  position: absolute;
  right: 13.5%;
  margin-top: 2.5px;
}

.select-version-revert:hover {
  background: #b63333;
}

</style>
