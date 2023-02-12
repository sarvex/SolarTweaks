<template>
  <TitleBar />
  <Content />
  <Footer />
</template>

<script>
import TitleBar from './components/TitleBar.vue';
import Content from './components/Content.vue';
import Footer from './components/Footer.vue';

import { checkDirectory } from './javascript/directories';
import constants from './constants';
import { login } from './javascript/discord';
import setupSettings from './javascript/settings';
import { clearLogs } from './javascript/logger';
import { checkForUpdates } from './javascript/updater';
import { remote } from 'electron';
import { join } from 'path';
import settings from 'electron-settings';
import { verifyEngine } from './javascript/engine';
import { doesLunarExists } from './javascript/lunar';

import './assets/global.css';

export default {
  name: 'App',

  components: {
    TitleBar,
    Content,
    Footer,
  },

  async mounted() {
    settings.configure({
      prettify: true,
      numSpaces: 4,
      atomicSave: true,
    });

    // Setup solartweaks folder
    const directories = [
      [[]],
      [['solartweaks'], ['jre']],
      [
        ['solartweaks', 'logs'],
        ['solartweaks', 'jres'],
      ],
    ];

    for (const directorySet of directories) {
      await Promise.all(
        directorySet.map((directory) =>
          checkDirectory(join(constants.DOTLUNARCLIENT, ...directory))
        )
      );
    }

    // Clear logs file because new launch (or reload)
    await clearLogs();

    // Settings
    await setupSettings();

    if (!navigator.onLine) {
      remote.dialog.showMessageBoxSync({
        type: 'error',
        title: 'No Internet Connection',
        message:
          'You are not connected to the internet. Please connect and try again.',
        buttons: ['OK'],
        defaultId: 0,
      });
      remote.app.quit();
    }

    // Engine/Metadata/Config-Example
    await verifyEngine();

    // Auto updater
    checkForUpdates(); // No await because running in background

    // Discord RPC
    login();

    if (await settings.get('shownTutorial'))
      this.$store.commit('setTutorialState', false);
    else this.$store.commit('setTutorialState', true);

    setTimeout(
      async () => {
        document.getElementById('loader-container').remove();
        if (doesLunarExists()) {
          await settings.set('LCInstalled', true);
        } else if (await settings.get('LCInstalled')) {
          await settings.set('LCInstalled', false);
          this.$store.commit(
            'setErrorMessage',
            'It looks like you dont have Lunar Client installed. \nYou need Lunar installed in order to use Solar Tweaks.\n\nPlease download Lunar from https://lunarclient.com/download\n\nIf you do have Lunar installed, please ignore this message and click the CLOSE button below.'
          );
          this.$store.commit('setErrorModal', true);
        }
      },
      // Give it an extra 50ms to load children
      Date.now() - document.created < 750
        ? 800 - (Date.now() - document.created)
        : 50
    );
  },
};
</script>

<style>
* {
  user-select: none;
  -webkit-user-select: none;
  padding: 0;
  margin: 0;
  font-family: Roboto, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: var(--color-background);
}

::-webkit-scrollbar {
  display: none;
}

.logo-white {
  /* Shoutouts to this codepen for generating the filter: https://codepen.io/sosuke/pen/Pjoqqp
  filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(265deg)
    brightness(100%) contrast(105%); */
  fill: aliceblue;
}
</style>
