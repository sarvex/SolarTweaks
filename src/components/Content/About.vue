<template>
  <div id="about-container">
    <Card
      icon="fa-solid fa-circle-info"
      title="LAUNCHER INFORMATION"
      subtitle="LAUNCHER VERSION, LINKS, AND LEARN ABOUT SOLAR TWEAKS"
      background="about"
      id="about-card"
      contentClass="vertical-card-container"
    >
      <button @click="downloadLogs()" id="download-logs-button">
        <i class="fa-solid fa-download button-icon"></i>
        DOWNLOAD LOGS
      </button>
      <div id="cards-item">
        <CardItem
          title="About Us"
          icon="fa-solid fa-user"
          id="about-us-card-item"
        >
          <p id="about-us">
            Solar Tweaks is a modification tool for Lunar Client. By modifying
            the game's code when it gets loaded, we add a variety of features
            that enhance your Minecraft experience. Browse and configure our
            Modules to your own needs under the Patcher tab, launch with a
            single click, and enjoy a new fully improved Lunar Client.
            <br />
            We are not affiliated with "Mojang, AB" or "Moonsworth, LLC". We are
            just a bunch of people that love Lunar Client and want to make it
            even better.
          </p>
        </CardItem>
        <div id="little-cards">
          <CardItem
            title="Solar Tweaks"
            icon="fa-solid fa-comments"
            subtitle="We are now using GitHub discussions to keep in touch with the community!"
            class="little-card"
          >
            <button
              @click="openLink(constants.links.GH_DISCUSSIONS)"
              class="button"
            >
              <i class="fa-solid fa-up-right-from-square button-icon"></i>
              GITHUB DISCUSSIONS
            </button>
          </CardItem>
          <CardItem
            title="LAUNCHER INFO"
            icon="fa-solid fa-code-branch"
            :subtitle="`Electron: v${aboutLauncherDescription.electron} • Node: v${aboutLauncherDescription.node} • Chrome: v${aboutLauncherDescription.chrome}`"
            class="little-card"
          >
            <button @click="openSolarTweaksFolder()" class="button">
              <i class="fa-solid fa-folder-open button-icon"></i>
              OPEN ST DIRECTORY
            </button>
          </CardItem>
          <CardItem
            title="LUNAR CLIENT"
            icon="fa-solid fa-moon"
            subtitle="Visit Lunar Client's official webpage, this includes their store and their latest blog-posts."
            class="little-card"
          >
            <button
              @click="openLink(constants.links.LUNARCLIENT)"
              class="button"
            >
              <i class="fa-solid fa-up-right-from-square button-icon"></i>
              LUNAR CLIENT
            </button>
          </CardItem>
          <CardItem
            title="PRIVACY POLICY"
            icon="fa-solid fa-bug"
            subtitle="We use a new debug log system with Sentry to track errors and implement fixes as fast as we can."
            class="little-card"
          >
            <button
              class="button"
              :class="SentryEnabled ? 'button-red' : ''"
              @click="toggleSentry()"
            >
              {{ SentryEnabled ? 'DISABLE' : 'ENABLE' }} LOGGING
            </button>
          </CardItem>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import { remote } from 'electron';
import process from 'process';
import Card from '../Card/Card.vue';
import CardItem from '../Card/CardItem.vue';
import constants from '../../constants';
import zipper from 'zip-local';
import { join } from 'path';
import settings from 'electron-settings';
import Logger from '../../javascript/logger';

const SentryLogger = new Logger('Sentry');

export default {
  name: 'About',
  components: {
    Card,
    CardItem,
  },
  data: () => ({
    constants,
    aboutLauncherDescription: {
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      launcher: remote.app.getVersion(),
    },
    SentryEnabled: false,
  }),
  methods: {
    /**
     * Opens a link in the default browser
     * @param {string} url The url to open
     */
    openLink(url) {
      remote.shell.openExternal(url);
    },
    /**
     * Opens the Solar Tweaks folder
     */
    openSolarTweaksFolder() {
      remote.shell.openPath(constants.SOLARTWEAKS_DIR);
    },
    /**
     * Download Logs and put them into a zip file
     */
    async downloadLogs() {
      return await new Promise((res, rej) =>
        zipper.zip(join(constants.SOLARTWEAKS_DIR, 'logs'), (err, zip) => {
          if (err) rej(err.message);
          else
            zip.save(join(constants.SOLARTWEAKS_DIR, 'logs.zip'), (err) => {
              if (err) rej(err.message);
              else {
                this.openSolarTweaksFolder();
                res(zip);
              }
            });
        })
      );
    },
    /**
     * Toggle Sentry Debug Logging
     */
    async toggleSentry() {
      this.SentryEnabled = !this.SentryEnabled;
      await settings.set('SentryEnabled', this.SentryEnabled);
      SentryLogger.info(
        `${this.SentryEnabled ? 'Enabled' : 'Disabled'} Sentry`
      );
    },
  },
  async beforeMount() {
    this.SentryEnabled = await settings.get('SentryEnabled');
  },
};
</script>

<style scoped>
#about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
#about-card {
  margin-top: 50px;
}
#about-us {
  text-align: center;
  font-size: smaller;
  font-weight: 300;
  letter-spacing: 0.25px;
  color: #cfcfcf;
  line-height: 1.5;
}
.little-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#little-cards {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.button-icon {
  margin-right: 5px;
}
.button {
  background-color: #269e4e;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  font-weight: 550;
  font-size: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 1.5px 0 rgba(0, 0, 0, 0.25);
  margin-top: 12px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.button:hover {
  background-color: #196d35;
}
#download-logs-button {
  background-color: #269e4e;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  font-weight: 550;
  font-size: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 1.5px 0 rgba(0, 0, 0, 0.25);
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  position: absolute;
  right: 6%;
  transform: translateY(-75px);
}
#download-logs-button:hover {
  background-color: #196d35;
}
#launcher-version {
  margin-top: 3px;
  font-weight: 400;
  text-align: center;
}
.button-red {
  background-color: #dd3e3e;
}
.button-red:hover {
  background-color: #c12c2c;
}
</style>
