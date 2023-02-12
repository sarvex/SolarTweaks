<template>
  <div id="content-container">
    <Play />
    <!-- Shows the component corresponding to the current active tab -->
    <component v-bind:is="$store.getters.getActiveTab" />
    <ErrorModal />
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
import ErrorModal from './Content/ErrorModal.vue';
import Debug from './Content/Debug.vue';

import SentryNotification from './SentryNotification';

export default {
  name: 'Content',
  components: {
    Play,
    Home,
    Servers,
    Engine,
    Settings,
    About,
    ErrorModal,
    Debug,
    SentryNotification,
  },
};
</script>

<style scoped></style>
