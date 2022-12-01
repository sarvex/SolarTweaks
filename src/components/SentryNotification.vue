<template>
  <div id="SentryNotification" v-if="!previouslyShown">
    <h4>PRIVACY POLICY</h4>
    <p>
      We use a new debug log system to track errors and implement fixes as fast
      as we can. Do you agree to this feature?
    </p>
    <button class="button" id="ok-button" @click="setEnabled(true)">
      I AGREE
    </button>
    <button class="button" id="opt-out-button" @click="setEnabled(false)">
      DISABLE
    </button>
  </div>
</template>

<script>
import settings from 'electron-settings';
import Logger from '../javascript/logger';

const logger = new Logger('Sentry');

export default {
  name: 'SentryNotification',
  data: () => ({
    previouslyShown: true,
  }),
  async beforeMount() {
    this.previouslyShown = await settings.has('SentryEnabled');
  },
  methods: {
    /**
     * Set whether Sentry should be enabled or not
     * @param {boolean} enabled Enabled or not
     */
    async setEnabled(enabled) {
      await settings.set('SentryEnabled', enabled);
      this.previouslyShown = true;
      logger.info(`${enabled ? 'Enabled' : 'Disabled'} Sentry`);
    },
  },
};
</script>

<style scoped>
#SentryNotification {
  position: fixed;
  right: 10px;
  bottom: 60px;
  padding: 10px 15px;
  background-color: rgb(14, 14, 14, 1);
  transition: box-shadow 0.5s ease, transform 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 10px;
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-transform: perspective(1px) scale3d(1, 1, 1);
  transform: perspective(1px) scale3d(1, 1, 1);
  width: 32.5%;
  padding-right: 15%;
}

p {
  margin-top: 5px;
  font-size: 0.85rem;
}

h4 {
  text-align: left;
  letter-spacing: 2px;
  font-style: italic;
  font-weight: 900;
  color: #28af55;
  font-size: 0.6rem;
}

.button {
  background: #28af55;
  border: none;
  border-radius: 5px;
  text-shadow: 0 2px 0 #00000061;
  font-weight: 500;
  letter-spacing: 0.2px;
  gap: 0px;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  margin-top: 2.5px;
  padding: 2% 3%;
  position: fixed;
  bottom: 20px;
  transition: background-color 0.2s ease-in-out;
}
.button:hover {
  background-color: #196d35;
}

#ok-button {
  right: 112px;
}
#opt-out-button {
  right: 12px;
}
</style>
