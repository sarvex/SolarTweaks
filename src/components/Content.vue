<template>
  <div id="content-container">
    <Play />
    <!-- Shows the component corresponding to the current active tab -->
    <component v-bind:is="$store.getters.getActiveTab" />
  </div>
</template>

<script>
import Play from './Content/Play.vue';
import Home from './Content/Home.vue';
import Servers from './Content/Servers.vue';
import Patcher from './Content/Patcher.vue';
import Settings from './Content/Settings.vue';
import About from './Content/About.vue';
/* import Discord from './Content/Discord.vue'; */

export default {
  name: 'Content',

  components: {
    Play,
    Home,
    Servers,
    Patcher,
    Settings,
    About,
  },
};
</script>

<style scoped></style>
