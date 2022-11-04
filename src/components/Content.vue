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
import Patcher from './Content/Patcher.vue';
import Settings from './Content/Settings.vue';
import About from './Content/About.vue';
import Debug from './Content/Debug.vue';

import SentryNotification from './SentryNotification';

export default {
  name: 'Content',
  components: {
    Play,
    Home,
    Servers,
    Patcher,
    Settings,
    About,
    Debug,
    SentryNotification,
  },
  mounted: () => {
    setTimeout(
      () => document.getElementById('loader-container').remove(),
      Date.now() - document.created < 750
        ? 750 - (Date.now() - document.created)
        : 0
    );
  },
};
</script>

<style scoped></style>
