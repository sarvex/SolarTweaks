<template>
  <div>
    <div
      id="play-container"
      :style="'height: ' + $store.getters.getPlayContainerHeight + 'px;'"
      @keydown="closeVersionSelection"
    >
      <div id="buttons" :class="{ disabled: $store.state.isLaunching }">
        <button
          id="play-button"
          @click="launchGame()"
          :disabled="$store.state.isLaunching"
        >
          <i
            class="play-btn-icon"
            :class="$store.state.launchingState.icon"
          ></i>
          <div class="play-button-content">
            <span id="play-btn-title">{{
              $store.state.launchingState.title
            }}</span
            ><br /><span id="play-btn-subtitle">{{
              $store.state.launchingState.message
            }}</span>
          </div>
        </button>
        <button
          id="change-version-button"
          @click="toggleSelectingMenu()"
          :disabled="$store.state.isLaunching"
        >
          <i class="fa-solid fa-angle-down change-version-icon"></i>
        </button>
      </div>
      <div
        id="select-version-container"
        v-if="isSelectingVersion"
        @keyup="closeVersionSelection"
        @mouseenter="hideTooltip"
      >
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
              v-bind:key="availableVersion.id"
              @click="selectVersion(availableVersion.id)"
            >
              <div class="select-version-card-inner-container">
                <div
                  class="select-version-card-inner-foreground"
                  :style="`background: url('${
                    availableVersion.images.foreground
                  }'); background-size: cover; ${
                    selectedVersion.id === availableVersion.id
                      ? 'filter: saturate(1) brightness(1);'
                      : ''
                  }`"
                ></div>
                <h3 class="select-version-card-title">
                  Version {{ availableVersion.id }}
                </h3>
                <div
                  className="select-version-card-inner-background"
                  :style="`background: url('${
                    availableVersion.images.background
                  }'); background-size: cover; ${
                    selectedVersion.id === availableVersion.id
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
          <div v-if="selectedVersion.carousel">
            <div class="select-version-carousel">
              <div
                class="select-version-carousel-image"
                :style="{ left: `-${currentIndex * 500}px` }"
              >
                <img
                  v-for="(image, currentIndex) in selectedVersion.carousel"
                  :key="selectedVersion.carousel[currentIndex]"
                  :src="selectedVersion.carousel[currentIndex].image"
                  :alt="selectedVersion.carousel[currentIndex].title"
                />
              </div>
              <h3>{{ selectedVersion.carousel[currentIndex].title }}</h3>
              <div class="select-version-carousel-buttons">
                <button @click="carouselPrevious">
                  <i class="fa-solid fa-circle-arrow-left" />
                </button>
                <button @click="carouselNext">
                  <i class="fa-solid fa-circle-arrow-right" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="select-version-display">
            <div
              class="select-version-display-foreground"
              :style="`background: url('${selectedVersion.images.foreground}'); background-size: cover;`"
            ></div>
            <h3 class="select-version-display-title">
              Version {{ selectedVersion.id }}
            </h3>
            <div
              class="select-version-display-background"
              :style="`background: url('${selectedVersion.images.background}'); background-size: cover;`"
            ></div>
          </div>
          <div
            class="select-version-display-fade"
            :style="`background: url('${selectedVersion.images.background}'); background-size: cover;`"
          ></div>
          <div class="select-version-info-description">
            <p>
              {{ selectedVersion.description }}
            </p>
          </div>
          <div class="select-version-grid">
            <button
              class="select-version-subversion"
              v-bind:class="{
                'select-version-selected':
                  selectedSubversion.id == subversion.id,
              }"
              v-for="subversion of selectedVersion.subversions"
              v-bind:key="subversion.id"
              @click="updateSelectedSubversion(subversion.id)"
            >
              <div class="subversion-snapshot" v-if="subversion.snapshot">
                <span>Snapshot</span>
              </div>
              {{ subversion.id }}
            </button>
          </div>
          <div className="select-version-options">
            <div class="select-version-modules">
              <h4>MODULES:</h4>
              <button
                ref="tooltipModule"
                @mouseenter="
                  showTooltip(
                    versionModule.name,
                    versionModule.description,
                    versionModule.credits
                  )
                "
                @mousemove="moveTooltip"
                @mouseleave="hideTooltip"
                v-for="versionModule in selectedSubversion.modules"
                v-bind:key="versionModule.id"
                @click="setModule(versionModule.id)"
                v-bind:class="{
                  'selected-module': selectedModule === versionModule.id,
                }"
                class="select-version-module"
                :style="`background: url('${versionModule.image}'); background-size: cover; background-position: center;`"
              ></button>
              <div
                v-show="show"
                ref="tooltip"
                :style="{ top: y + 'px', left: x + 'px' }"
                class="tooltip"
              >
                <h3>
                  {{ moduleName }}
                </h3>
                <p>
                  {{ moduleDescription }}
                </p>
                <h4 v-if="moduleCredits">
                  <span>Credits:</span> {{ moduleCredits }}
                </h4>
              </div>
            </div>
            <button class="select-version-save" @click="saveChanges()">
              <i class="fa-solid fa-floppy-disk"></i>
              <h3>SAVE</h3>
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
import constants from '../../constants';
import { platform, release, arch as osArch } from 'os';
import { cache } from '../../main';

const logger = new Logger('play');

export let availableVersions = [];

export default {
  name: 'Play',
  data: () => ({
    show: false,
    x: 0,
    y: 0,
    moduleName: 'Lunar',
    moduleDescription: 'Base Lunar Client with its own mods.',
    moduleCredits: false,
    isSelectingVersion: false,
    isLaunching: false,
    selectedVersion: {},
    selectedSubversion: {},
    currentIndex: 0,
    /** @type {"lunar-noOF" | "lunar" | "neu" | "sodium"} */
    selectedModule: 'lunar',
    availableVersions: [],
    mainBackgroundURL: '',
  }),

  methods: {
    /**
     * Carousel
     */

    async carouselPrevious() {
      if (this.currentIndex === 0) {
        this.currentIndex = this.selectedVersion.carousel.length - 1;
      } else {
        this.currentIndex--;
      }
    },
    async carouselNext() {
      if (this.currentIndex === this.selectedVersion.carousel.length - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
    },

    async beforeDestroy() {
      clearInterval(this.intervalId);
    },

    /**
     * Close Menu using ESC key.
     */

    async closeVersionSelection(event) {
      if (event.key === 'Escape') {
        await settings.set('version', this.selectedSubversion.id);
        await settings.set('module', this.selectedModule);
        await this.updateLaunchButton();
        await this.toggleSelectingMenu();
        this.isSelectingVersion = false;
        console.log('[Version Selection] Menu closed using "ESC" key.');
      }
    },

    /**
     *  Tooltip
     */

    async showTooltip(moduleName, moduleDescription, moduleCredits) {
      this.moduleName = moduleName;
      this.moduleDescription = moduleDescription;
      this.moduleCredits = moduleCredits;
      this.show = true;
    },
    async moveTooltip(event) {
      this.x = event.clientX + 20;
      this.y = event.clientY - 50;
    },
    async hideTooltip() {
      this.show = false;
    },
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
     * @param {string} version The version id
     */
    async selectVersion(version) {
      await this.updateSelectedVersion(version);
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
        this.availableVersions.find(
          (i) =>
            i.id === version || i.subversions.map((e) => e.id).includes(version)
        ) ?? {};
      await this.updateSelectedSubversion('');
    },
    /**
     * Update the selected subversion
     * @param {string} version The subversion
     */
    async updateSelectedSubversion(version) {
      if (!version) version = await settings.get('version');
      this.selectedSubversion =
        this.selectedVersion.subversions.find((i) => i.id === version) ??
        this.selectedVersion.subversions.find((i) => i.default);
      if (
        !this.selectedSubversion.modules.find(
          (i) => i.id == this.selectedModule
        )
      )
        this.selectedModule = this.selectedSubversion.modules.find(
          (i) => i.default
        ).id;
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
      await settings.set('version', this.selectedSubversion.id);
      await settings.set('module', this.selectedModule);
      await this.updateLaunchButton();
      await this.toggleSelectingMenu();
      console.log('[Version Selection] Menu closed using "Save" button.');
      this.updateMainBackground();
    },
    updateMainBackground() {
      this.mainBackgroundURL = this.selectedVersion.carousel?.length
        ? this.selectedVersion.carousel[
            Math.floor(
              Math.random() * this.selectedVersion.carousel.length - 0.1
            )
          ].image
        : this.selectedVersion.images.background;
    },
  },
  async mounted() {
    // Timeout because when first launch there is no version set
    setTimeout(async () => {
      await this.updateLaunchButton();
      await this.updateSelectedVersion();
      this.setModule(await settings.get('module'));
      this.updateMainBackground();
    }, 150);
  },
  async beforeMount() {
    this.$watch(
      () => this.availableVersions,
      () => {
        availableVersions = this.availableVersions;
        console.log(availableVersions);
      }
    );
    let data;
    if (cache.has('lc_launcher_metadata'))
      data = cache.get('lc_launcher_metadata');
    else {
      data = await fetch(
        constants.links.LC_LAUNCHER_METADATA_ENDPOINT +
          '?' +
          new URLSearchParams({
            os: platform(),
            os_release: release(),
            arch: osArch(),
            branch: 'master',
            branch_changed: false,
            private: false,
            launcher_version: constants.LC_LAUNCHER_VERSION,
          }).toString()
      ).then((res) => res.json());
      cache.set('lc_launcher_metadata', data);
    }
    this.availableVersions = data.versions;
  },
};
</script>

<style scoped lang="scss">
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
  padding-top: 60px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25)),
    var(--play-background) repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s cubic-bezier(0.2, 0.05, 0.55, 1);
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

  &:hover {
    box-shadow: 0 0 40px -5px #28af559b;
    transform: scale(1.05) translate3d(0, 0, 0) perspective(1px);
  }

  &.disabled {
    box-shadow: 0 0 25px -5px purple;

    &:hover {
      box-shadow: 0 0 40px -5px purple;
    }
  }
}

#play-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-shadow: 0 0 25px -5px var(--color-green);
  background-color: var(--color-green);
  border: none;
  width: 315px;
  height: 70px;
  text-align: left;
  border-top-left-radius: 0.7rem;
  border-bottom-left-radius: 0.7rem;
  transition: background-color 0.5s ease;
  cursor: pointer;
  text-shadow: 0 1.25px 0 rgba(0, 0, 0, 0.25);

  &:hover {
    background-color: var(--color-green-hover);
    text-shadow: 0 1.25px 0 rgba(0, 0, 0, 0.25);
  }

  &:disabled {
    background-color: rgba(128, 0, 128, 0.85);
    box-shadow: 0 0 40px -5px #800080;
    cursor: default;
    width: 355px;
    border-radius: 10px;
  }
}

#change-version-button {
  box-shadow: 0 0 25px -5px #28af55;
  background-color: var(--color-green);
  border: none;
  margin-left: 0px;
  width: 40px;
  height: 70px;
  border-top-right-radius: 0.7rem;
  border-bottom-right-radius: 0.7rem;
  transition: background-color 0.5s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--color-green-hover);
  }

  &:disabled {
    display: none;
  }
}

#play-btn-title {
  font-size: x-large;
  text-align: left;
  font-weight: 700;
  letter-spacing: 2.5px;
  line-height: 1.2;
}

.play-btn-icon {
  font-size: 1.5rem;
  margin-right: 28px;
}

#play-btn-subtitle {
  font-size: 0.775rem;
  text-align: left;
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
  background-color: var(--backdrop-background);
  backdrop-filter: blur(0.5rem);
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
  scroll-behavior: smooth;
  margin: 15px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  width: 700px;
  height: 500px;
  grid-column-gap: 5px;
  grid-row-gap: 20px;
  overflow-y: scroll;
  padding-right: 0px;
  text-align: center;
}

.select-version-card {
  width: 340px;
  height: 147px;
  border-radius: 5px;
  cursor: pointer;
  overflow: hidden;

  .select-version-card-inner-container {
    display: flex;
    align-content: center;
    justify-content: center;
    width: 340px;
    height: 147px;
    transform: scale(1) translate3d(0, 0, 0) perspective(0.15px);
    text-shadow: 0 2px 0 rgb(0, 0, 0, 0.2);
    transition: 0.5s ease;
    font-smooth: subpixel-antialiased;
    -webkit-font-smoothing: subpixel-antialiased;

    .select-version-card-inner-foreground {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 2;
      filter: saturate(0) brightness(1);
      transition: 0.25s ease-in-out;
    }

    &:hover {
      transform: scale(1.095) translate3d(0, 0, 0) perspective(0.15px);

      .select-version-card-inner-foreground {
        filter: saturate(1) brightness(1);
      }
    }
  }

  .select-version-card-title {
    position: absolute;
    font-family: var(--font-secondary);
    font-size: 2.55rem;
    letter-spacing: 1px;
    margin-top: 50px;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
    z-index: 1;
    font-smooth: subpixel-antialiased;
    -webkit-font-smoothing: subpixel-antialiased;
  }

  .select-version-card-inner-background {
    filter: saturate(0) brightness(0.9);
    height: 100%;
    width: 100%;
    transition: 0.25s ease-in-out;
  }
}

.select-version-info {
  display: flex;
}

#select-version-info-title {
  letter-spacing: 2px;
  font-weight: 600;
  font-size: 25px;
}

.select-version-carousel {
  margin-top: 5px;
  display: flex;
  position: relative;
  width: 500px;
  height: 220px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  overflow: hidden;

  h3 {
    position: absolute;
    z-index: 5;
    bottom: 0;
    left: 0;
    margin: 15px 10px;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 5rem;
    font-family: var(--font-secondary);
    letter-spacing: 1px;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
    background-color: rgb(0 0 0 / 20%);
    backdrop-filter: blur(2rem);
    padding: 5px 10px;
  }

  .select-version-carousel-buttons {
    position: absolute;
    z-index: 5;
    bottom: 0;
    right: 0;
    margin: 10px;
    display: flex;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      outline: none;
      font-size: 2rem;
      font-weight: 500;
      border-radius: 5rem;
      font-family: var(--font-secondary);
      letter-spacing: 1px;
      text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
      background: none;
      cursor: pointer;
      padding: 5px 10px;

      &:hover {
        opacity: 0.5;
      }
    }
  }

  .select-version-carousel-image {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: absolute;
    width: auto;
    height: 220px;
    animation: fade_up 0.5s ease;
    opacity: 0;
    animation-fill-mode: forwards;
    transition: left 0.5s ease;

    img {
      image-rendering: crisp-edges;
      width: 500px;
      height: 280px;
      z-index: 2;
      // animation: fade_up 0.5s ease;
      // opacity: 0;
      // animation-fill-mode: forwards;
      transition: 0.5s ease-in-out;
    }
  }
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
  overflow: hidden;

  .select-version-display-foreground {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 2;
  }

  .select-version-display-title {
    position: absolute;
    font-family: var(--font-secondary);
    font-size: 55px;
    letter-spacing: 1px;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
    z-index: 1;
    animation: fade_up 0.5s ease;
    opacity: 0;
    animation-fill-mode: forwards;
  }

  .select-version-display-background {
    height: 100%;
    width: 100%;
  }
}

.select-version-display-fade {
  position: absolute;
  top: 0;
  right: 0;
  background-position: center;
  background-size: cover;
  height: 100%;
  width: 30%;
  opacity: 0.2;
  filter: blur(200px);
  transition: 0.2s ease;
}

.select-version-info-description {
  position: relative;
  font-size: 13px;
  margin-top: 15px;
  overflow-y: scroll;
  width: 500px;
  height: 8em;
  padding-right: 7.5px;
  text-align: justify;
}

.select-version-grid {
  $min-col-width: 150px;

  position: absolute;
  margin-top: 15px;
  width: 500px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax($min-col-width, 1fr));
  grid-template-rows: 1fr;
  grid-row-gap: 5px;
  grid-column-gap: 15px;

  button.select-version-subversion {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    outline: none;
    border: none;
    background: rgb(255 255 255 / 15%);
    border-radius: 0.25rem;
    padding: 10px 25px;
    font-weight: 500;
    font-size: 1rem;
    width: 100%;
    text-shadow: 0 1px 0 rgb(0 0 0 / 85%);
    transition: background-color 0.15s ease-in-out;

    .subversion-snapshot {
      display: flex;
      gap: 5px;
      position: absolute;
      align-items: center;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-style: italic;
      font-weight: 600;
      border-radius: 5rem;
      letter-spacing: 2px;
      padding: 2.5px 15px;
      transform: translateY(-22.5px);
      text-shadow: 0 1px 0 rgb(0 0 0 / 25%);
      background: var(--color-red);

      span {
        color: white;
      }
    }

    &:hover {
      background: rgb(255 255 255 / 20%);
    }

    &.select-version-selected {
      background-color: var(--color-green);
      &:hover {
        background-color: var(--color-green);
      }
    }
  }
}

.select-version-modules {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
}

.select-version-options {
  margin-top: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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
  transition: opacity 0.2s ease;
  image-rendering: optimizeQuality;
  opacity: 0.5;

  &:hover {
    opacity: 0.7;
  }

  &::after {
    position: absolute;
    content: '';
    width: 46px;
    height: 46px;
    transform: translate(-4.5px, -22.5px) scale(0.85);
    opacity: 0;
    background: transparent;
    border-radius: 999rem;
    display: flex;
    box-shadow: 0 0 0 0px var(--color-text) inset;
    transition: 0.5s ease;
  }

  &.selected-module {
    opacity: 1;

    &::after {
      opacity: 1;
      transform: translate(-4.5px, -22.5px) scale(1);
      box-shadow: 0 0 0 2px var(--color-text) inset;
    }
  }
}

.select-version-save {
  display: flex;
  flex-direction: row;
  background: rgba(255, 255, 255, 0);
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  letter-spacing: 1px;
  text-shadow: 0 2px 0 #00000080;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.select-version-save:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tooltip {
  position: absolute;
  width: 220px;
  font-size: 0.7rem;
  text-align: left;
  border: 1px solid var(--color-darker-gray);
  background-color: rgb(0 0 0 / 40%);
  backdrop-filter: blur(2rem);
  padding: 10px;

  h3 {
    font-weight: 500;
    font-size: 0.85rem;
    margin-bottom: 2.5px;
  }

  p {
    font-weight: 400;
    color: var(--color-light-gray);
  }

  h4 {
    font-size: 0.7rem;
    margin-top: 5px;
    font-weight: 400;
    letter-spacing: 0;
  }
}
</style>
