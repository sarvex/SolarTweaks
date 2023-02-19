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
            Modules to your own needs under the Engine tab, launch with a single
            click, and enjoy a new fully improved Lunar Client.
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
              v-bind:class="{
                'button-red': SentryEnabled,
              }"
              @click="toggleSentry()"
            >
              {{ SentryEnabled ? 'DISABLE' : 'ENABLE' }} LOGGING
            </button>
          </CardItem>
        </div>
      </div>
    </Card>
    <Card
      icon="fa-solid fa-circle-info"
      title="CREDITS"
      subtitle="LIST OF PEOPLE THAT HAVE HELPED MAKE SOLAR TWEAKS"
      background="about"
      id="about-card"
      contentClass="vertical-card-container"
      class="credits-card"
    >
      <h2>Main Developers</h2>
      <div class="credits-row">
        <CardItem
          v-for="user of credits.main"
          :key="user.name"
          :title="
            user.aka
              ? `${user.name}<br/><small><small>(AKA ${user.aka})</small></small>`
              : user.name
          "
          :subtitle="user.reason"
        >
          <img class="user-avatar" :src="user.avatar" />
          <p @click="openLink(user.link)" class="user-link" v-if="user.link">
            View on Github
          </p>
        </CardItem>
      </div>
      <h2>Other Helpers</h2>
      <div class="credits-row">
        <CardItem
          v-for="user of credits.others"
          :key="user.name"
          :title="
            user.aka
              ? `${user.name}<br/><small><small>(AKA ${user.aka})</small></small>`
              : user.name
          "
          :subtitle="user.reason"
        >
          <img class="user-avatar" :src="user.avatar" />
          <p @click="openLink(user.link)" class="user-link" v-if="user.link">
            View on Github
          </p>
        </CardItem>
      </div>
      <h2>Translators</h2>
      <div class="credits-row">
        <CardItem
          v-for="user of credits.translators"
          :key="user.name"
          :title="
            user.aka
              ? `${user.name}<br/><small><small>(AKA ${user.aka})</small></small>`
              : user.name
          "
        >
          <img class="user-avatar" :src="user.avatar" />
          <p @click="openLink(user.link)" class="user-link" v-if="user.link">
            View on Github
          </p>
        </CardItem>
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
    credits: {
      main: [
        {
          name: 'Cy0ze',
          link: 'https://github.com/Cy0ze',
          avatar: 'https://avatars.githubusercontent.com/u/35305825',
          reason:
            'Original Lead Developer<br/>(Now moved on to Solar Tweaks v5)',
        },
        {
          name: 'NotEvenJoking',
          link: 'https://github.com/770grappenmaker',
          avatar: 'https://avatars.githubusercontent.com/u/50543283',
          reason: 'Main Engine Developer',
          aka: '770grappenmaker',
        },
        {
          name: 'TBHGodPro',
          link: 'https://github.com/TBHGodPro',
          avatar:
            'https://cdn.discordapp.com/avatars/668116405765537808/84d5615892223cd66e512db4a6f44d53.webp?size=1280',
          reason: 'Main Back-End Developer',
          aka: 'Skull Emoji',
        },
        {
          name: 'Naibuu',
          link: 'https://github.com/Naibuu',
          avatar: 'https://avatars.githubusercontent.com/u/81579850',
          reason: 'Main Front-End Designer',
        },
        {
          name: 'RadNotRed',
          link: 'https://github.com/RadNotRed',
          avatar: 'https://avatars.githubusercontent.com/u/80015713',
          reason: 'Manager',
          aka: 'rad',
        },
      ],
      others: [
        {
          name: 'HypedDomi',
          link: 'https://github.com/HypedDomi',
          avatar: 'https://avatars.githubusercontent.com/u/50876016',
          reason: 'Helped develop many features and gave ideas',
        },
        {
          name: 'Leoo',
          link: 'https://github.com/heyitsleo',
          avatar: 'https://avatars.githubusercontent.com/u/111710350',
          reason: 'Gave ideas for many features and helped fix bugs',
        },
        {
          name: 'Waffles',
          link: 'https://github.com/Waffles3438',
          avatar: 'https://avatars.githubusercontent.com/u/96705793',
          reason: 'Helped bug test',
        },
      ],
      translators: [
        {
          name: 'HypedDomi',
          link: 'https://github.com/HypedDomi',
          avatar: 'https://avatars.githubusercontent.com/u/50876016',
        },
        {
          name: 'Negancy',
          avatar:
            'https://cdn.discordapp.com/avatars/545290605387841558/a16052ce9f1917c6394eb9bf447ac88d.webp?size=1280',
        },
        {
          name: 'Waffles',
          link: 'https://github.com/Waffles3438',
          avatar: 'https://avatars.githubusercontent.com/u/96705793',
        },
        {
          name: 'Kianna',
          avatar:
            'https://cdn.discordapp.com/avatars/851540510128341104/33df95f62f82ce6d44f4443ce25b907f.webp?size=1280',
        },
        {
          name: "It's Piev",
          avatar:
            'https://cdn.discordapp.com/avatars/809094383219638283/1ab130e761d82ec35711c3fa85c96eca.webp?size=1280',
        },
      ],
    },
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
          if (err) rej(err.stack);
          else
            zip.save(join(constants.SOLARTWEAKS_DIR, 'logs.zip'), (err) => {
              if (err) rej(err.stack);
              else {
                remote.shell.showItemInFolder(
                  constants.SOLARTWEAKS_DIR + '/logs.zip'
                );
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
  async beforeCreate() {
    this.SentryEnabled = await settings.get('SentryEnabled');
  },
};
</script>

<style scoped>
#about-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  margin-bottom: 750px;
  height: 650px;
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
  background-color: var(--color-green);
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

.credits-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
}

.user-avatar {
  margin-top: 20px;
  width: 80px;
  border-radius: 20px;
}

.user-link {
  display: flex;
  flex-direction: column;
  color: lightblue;
}
.user-link:hover {
  cursor: pointer;
  text-decoration: underline;
}

.credits-card {
  text-align: center;
}
</style>
