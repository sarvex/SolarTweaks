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
          @click="isSelectingVersion = !isSelectingVersion"
          :disabled="$store.state.isLaunching"
        >
          <i class="fa-solid fa-angle-down play-btn-icon"></i>
        </button>
      </div>
      <div
        id="select-version-container"
        v-if="isSelectingVersion"
        @click="isSelectingVersion = !isSelectingVersion"
      >
        <h2 id="select-version-title">LAUNCH OPTIONS</h2>
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
                class="select-version-card-inner-icon"
                :style="`background: url('${availableVersion.foreground}'); background-size: cover;`"
              ></div>
              <h3 class="select-version-card-title">
                Version {{ availableVersion.version }}
              </h3>
              <div
                className="select-version-card-inner-background"
                :style="`background: url('${availableVersion.background}'); background-size: cover;`"
              ></div>
            </div>
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
    availableVersions: [
      {
        version: '1.8.9',
        background: 'https://i.imgur.com/LnH3eXS.png',
        foreground: 'https://i.imgur.com/0hmHVkF.png',
      },
      {
        version: '1.19.2',
        background: 'https://i.imgur.com/ANRhYQm.png',
        foreground: 'https://i.imgur.com/fbPfBYF.png',
      },
      {
        version: '1.18.2',
        background: 'https://i.imgur.com/mmqLgFc.png',
        foreground: 'https://i.imgur.com/RmyDXMu.png',
      },
      {
        version: '1.17.1',
        background: 'https://i.imgur.com/iFgh5i5.png',
        foreground: 'https://i.imgur.com/XAO2Ukn.png',
      },
      {
        version: '1.16.5',
        background: 'https://i.imgur.com/UejXvJ3.png',
        foreground: 'https://i.imgur.com/kuiEjtB.png',
      },
      {
        version: '1.12.2',
        background: 'https://i.imgur.com/MuhKNvq.png',
        foreground: 'https://i.imgur.com/tEJfw4V.png',
      },
      {
        version: '1.7.10',
        background: 'https://i.imgur.com/0TBL35M.png',
        foreground: 'https://i.imgur.com/CarlaIS.png',
      },
    ],
  }),

  methods: {
    /**
     * Launch the game
     */
    async launchGame() {
      await checkAndLaunch().catch((error) => {
        logger.error(error);
        updateActivity('In the launcher');
      });
    },

    /**
     * Set new version as default
     */
    async selectVersion(version) {
      await settings.set('version', version);
      await this.updateLaunchButton();
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
  },

  async mounted() {
    // Timeout because when first launch there is no version set
    setTimeout(async () => await this.updateLaunchButton(), 150);
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
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
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height 0.5s ease-in-out;
}

#buttons {
  box-shadow: 0 0 25px -5px #28af55;
  transition: box-shadow 0.5s ease, transform 0.5s ease-in-out;
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
  background-color: #2cbe5dd1;
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
  transition: background-color 0.3s ease;
  cursor: pointer;
}

#change-version-button:hover {
  background-color: #2cbe5dd1;
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-top: 110px;
  z-index: 1;
  overflow-y: scroll;
  background-color: #000000cc;
  text-align: center;
}

#select-version-title {
  letter-spacing: 2px;
  font-weight: 600;
  font-size: 35px;
  margin-top: 2%;
}

#select-version-subtitle {
  letter-spacing: 2px;
  font-weight: 400;
  margin-top: 5px;
}

#select-version-grid {
  margin-left: 300px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  width: 700px;
  height: 500px;
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  overflow-y: scroll;
  padding-right: 8px;
  margin-top: 15px;
  text-align: center;
}

.select-version-card {
  height: 150px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;
  backface-visibility: hidden;
}

.select-version-card-inner-container {
  display: flex;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transform: perspective(1px) scale(1.05);
  -webkit-transform: perspective(1px) scale(1.05);
  text-shadow: 0 2px 0 rgb(0, 0, 0, 0.2);
  transition: 0.55s ease;
  filter: saturate(0) brightness(0.65);
  font-smoothing: subpixel-antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
}

.select-version-card-inner-container:hover {
  filter: saturate(1);
  transform: perspective(1px) scale(1.15);
  -webkit-transform: perspective(1px) scale(1.15);
}

.select-version-card-inner-icon {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
}

.select-version-card-title {
  position: absolute;
  font-family: 'Panton';
  font-size: 30px;
  letter-spacing: 1px;
  margin-top: 58px;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
}

.select-version-card-inner-background {
  height: 100%;
  width: 100%;
}
</style>
