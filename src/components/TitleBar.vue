<template>
  <div id="fixed-container">
    <div id="title-bar-container">
      <div id="title-bar-label" @click="registerClick()">
        <img
          src="https://i.imgur.com/QS5ZAal.png"
          id="title-image"
          alt="Solar Tweaks Logo"
          class="logo-white"
          height="58"
          width="249"
          draggable="false"
        />
      </div>
      <div id="nav-container">
        <ul id="nav">
          <li v-for="link in links" v-bind:key="link.name" class="nav-item">
            <button
              class="nav-btn"
              :disabled="link.active"
              @click="setActiveTab(link.name)"
            >
              {{ link.name }}
            </button>
          </li>
        </ul>
      </div>
      <div id="button-container">
        <div>
          <button
            class="titlebar-button"
            @click="toggleTheme"
            v-if="showThemeSwapper"
          >
            <i class="fa-solid fa-brush titlebar-button-icon"></i>
          </button>
        </div>
        <button class="titlebar-button" @click="showTutorial()">
          <i class="fa-solid fa-book titlebar-button-icon"></i>
        </button>
        <button class="titlebar-button" id="close-btn" @click="closeWindow()">
          <i class="fa-solid fa-xmark fa-2x titlebar-button-icon"></i>
        </button>
      </div>
    </div>
  </div>
  <ShowTutorial />
</template>

<script>
import ShowTutorial from './Tutorial.vue';
import { remote } from 'electron';
import settings from 'electron-settings';

export default {
  name: 'TitleBar',

  components: {
    ShowTutorial,
  },

  data: () => ({
    theme: 'dark',
    showThemeSwapper: false,

    links: [
      {
        name: 'Home',
        active: false,
      },
      {
        name: 'Servers',
        active: false,
      },
      {
        name: 'Engine',
        active: false,
      },
      {
        name: 'Settings',
        active: false,
      },
      {
        name: 'About',
        active: false,
      },
    ],
    clickCount: 0,
  }),

  methods: {
    /**
     * Close the window
     */
    closeWindow() {
      remote.getCurrentWindow().close();
    },

    /**
     * Set the active tab``
     * @param {string} tabName The name of the tab to set as active
     */
    setActiveTab(tabName) {
      this.$store.commit('setActiveTab', tabName);
      this.links.find((link) => link.active).active = false;
      this.links.find((link) => link.name === tabName).active = true;

      if (tabName === 'Home') {
        this.$store.commit('setPlayContainerHeight', 300);
      } else this.$store.commit('setPlayContainerHeight', 135);
    },

    /**
     * Open the tutorial window
     */
    showTutorial() {
      this.$store.commit('setTutorialState', true);
    },

    async toggleTheme() {
      if (this.theme === 'dark') this.theme = 'light';
      else this.theme = 'dark';
      document.body.setAttribute('data-theme', this.theme);
      await settings.set('theme', this.theme);
    },

    async registerClick() {
      this.clickCount++;
      if (this.clickCount >= 10) {
        await settings.set('themeSwapperEnabled', true);
        if (this.theme === 'dark') this.toggleTheme();
      }
    },

    runDevShortcut() {
      if (!this.links.find((link) => link.name == 'Debug')) {
        let keysDone = '';
        let keysAll = 'devenable';
        let last = 0;
        const listener = async (event) => {
          if (Date.now() - last > 2000) keysDone = '';
          if (event.key == keysAll.charAt(keysDone.length))
            keysDone += event.key;
          else keysDone = '';
          if (keysDone.length == keysAll.length) {
            if (!this.links.find((link) => link.name == 'Debug'))
              this.links.push({ name: 'Debug', active: false });
            await settings.set('DeveloperMode', true);
            document.removeEventListener('keydown', listener);
          }
          last = Date.now();
        };
        document.addEventListener('keydown', listener);
      }
    },
  },

  async beforeMount() {
    // Starts as ON if served and OFF if packaged
    if (!(await settings.has('DeveloperMode')))
      await settings.set('DeveloperMode', !remote.app.isPackaged);
    if (await settings.get('DeveloperMode'))
      this.links.push({ name: 'Debug', active: false });

    this.clickCount = 0;
    this.showThemeSwapper = await settings.get('themeSwapperEnabled');
    this.theme = this.showThemeSwapper ? await settings.get('theme') : 'dark';
    document.body.setAttribute('data-theme', this.theme);
  },

  mounted() {
    document.body.setAttribute('data-theme', this.theme);
    // Set the active tab to the store's active tab
    this.links.find(
      (link) => link.name === this.$store.getters.getActiveTab
    ).active = true;

    this.runDevShortcut();
  },
};
</script>

<style scoped>
#fixed-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 10;
}

#title-bar-container {
  height: 100px;
  width: 100%;
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 110px;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0%,
    rgb(0, 0, 0, 0.7) 100%
  );
}

#title-bar-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  filter: var(--logo-brightness);
  z-index: 100000;
  -webkit-app-region: none;
  left: 0;
  position: absolute;
}

#title-image {
  margin-left: 25px;
  margin-right: 15px;
}

#title {
  color: #fff;
  font-family: 'Roboto', sans-serif;
  letter-spacing: 1px;
  font-size: 1.85rem;
  font-weight: 500;
  line-height: 1.2;
}

#nav {
  list-style-type: none;
}

#nav-container {
  position: absolute;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.nav-item {
  display: inline;
  margin: 0 5px;
}

.nav-btn {
  position: relative;
  -webkit-app-region: no-drag;
  background-color: transparent;
  width: 100px;
  height: 40px;
  border: none;
  color: #a6a6a6;
  letter-spacing: 0.25px;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease, color 0.25s ease, box-shadow 0.3s ease;
  font-size: 16px;
  font-weight: 500;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  color: #bbbbbb;
}

.nav-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0) inset;
  color: #bbbbbb;
  cursor: pointer;
}

.titlebar-button {
  -webkit-app-region: no-drag;
  background: rgba(255, 255, 255, 0.05);
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.5s ease-out, box-shadow 0.5s ease;
}

.titlebar-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

#button-container {
  display: flex;
  flex-direction: row;
  gap: 5px;
  text-align: right;
  align-items: center;
  justify-content: right;
  position: absolute;
  right: 30px;
}

.titlebar-button-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.3));
}
</style>
