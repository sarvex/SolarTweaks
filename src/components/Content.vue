<template>
  <div id="content-container">
    <Play />
    <!-- Shows the component corresponding to the current active tab -->
    <component v-bind:is="$store.getters.getActiveTab" />
    <SentryNotification />
  </div>
</template>

<script>
import Play from './Content/Play.vue';
import Home from './Content/Home.vue';
import Servers from './Content/Servers.vue';
import Engine from './Content/Engine.vue';
import Settings from './Content/Settings.vue';
import About from './Content/About.vue';
import Debug from './Content/Debug.vue';

import SentryNotification from './SentryNotification';
import { verifyEngine } from '../javascript/engine';

export default {
  name: 'Content',
  components: {
    Play,
    Home,
    Servers,
    Engine,
    Settings,
    About,
    Debug,
    SentryNotification,
  },
  async mounted() {
    await verifyEngine();
    setTimeout(
      () => document.getElementById('loader-container').remove(),
      // Give it an extra 50ms to load children
      Date.now() - document.created < 750
        ? 800 - (Date.now() - document.created)
        : 50
    );
  },
};
</script>

<style scoped></style>
