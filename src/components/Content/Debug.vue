<template>
  <div id="debug-container">
    <Card
      icon="fa-solid fa-cogs"
      title="DEVELOPER SETTINGS"
      subtitle="DO NOT MESS WITH ANYTHING HERE UNLESS YOU ARE EITHER A SOLAR TWEAKS ADMIN OR DEVELOPER"
      background="about"
      contentClass="debug-card"
    >
      <div class="row">
        <button @click="clearSettings()" c>Clear Settings</button>
        <button @click="openFile(settingsFile)">Open Settings File</button>
        <button @click="setSettingsItem('DeveloperMode', false)">
          Disable Developer Mode
        </button>
      </div>
      <div class="row">
        <button @click="setSettingsItem('SentryEnabled')">
          Reset Sentry Notif
        </button>
        <button @click="setSettingsItem('themeSwapperEnabled')">
          Disable Theme Swapper
        </button>
        <button @click="setSettingsItem('shownTutorial')">
          Reset Shown Tutorial
        </button>
      </div>
      <div class="row"></div>
    </Card>
  </div>
</template>

<script>
import Card from '../Card/Card.vue';

import { remote } from 'electron';
import settings from 'electron-settings';
import { readFile, writeFile } from 'fs/promises';
import Logger from '../../javascript/logger';

const logger = new Logger('Debug Mode');

export default {
  name: 'Debug',
  data: () => ({
    settingsFile: settings.file(),
  }),
  components: {
    Card,
  },
  methods: {
    /**
     * Clear the settings file
     */
    async clearSettings() {
      const old = JSON.parse(await readFile(this.settingsFile, 'utf-8'));
      let data = {
        servers: old.servers,
        ram: old.ram,
      };
      await writeFile(this.settingsFile, JSON.stringify(data), 'utf-8');
      logger.info('Cleared Settings and set to', data);
    },
    async openFile(path) {
      await remote.shell.openPath(path);
    },

    async setSettingsItem(name, value) {
      const data = JSON.parse(await readFile(this.settingsFile, 'utf-8'));
      if (value !== undefined) data[name] = value;
      else delete data[name];
      await writeFile(this.settingsFile, JSON.stringify(data), 'utf-8');
      logger.info(`Deleted "${name}" Property of Settings`);
    },
  },
};
</script>

<style>
.debug-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

<style scoped>
#debug-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

button {
  margin: 5px 10px;
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
  transition: background-color 0.25s ease-in-out;
}
button:hover {
  background-color: #196d35;
}

.row {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}
.row:first-of-type {
  margin-top: 15px;
}
.row:last-of-type {
  margin-bottom: 15px;
}
</style>
