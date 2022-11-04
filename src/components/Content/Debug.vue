<template>
  <h1 class="title">Debug</h1>
  <div>
    <button @click="clearSettings()" c>Clear Settings</button>
    <button @click="openFile(settingsFile)">Open Settings File</button>
  </div>
</template>

<script>
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
  methods: {
    /**
     * Clear the settings file
     */
    async clearSettings() {
      const old = JSON.parse(await readFile(this.settingsFile, 'utf-8'));
      let data = {
        downloadedJres: old.downloadedJres,
        servers: old.servers,
        customizations: old.customizations,
        ram: old.ram,
      };
      await writeFile(this.settingsFile, JSON.stringify(data), 'utf-8');
      logger.info('Cleared Settings and set to', data);
    },
    async openFile(path) {
      await remote.shell.openPath(path);
    },
  },
};
</script>

<style scoped>
* {
  align-items: center;
  text-align: center;
}
.title {
  margin-top: 15px;
}

div {
  margin-top: 15px;
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
  margin-top: 12px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.25s ease-in-out;
}
button:hover {
  background-color: #196d35;
}
</style>
