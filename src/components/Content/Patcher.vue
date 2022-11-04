<template>
  <div
    id="options-background-filter"
    @click="toggleCustomizationOptions(null)"
    v-if="customizing.open"
  ></div>
  <div id="options-container" v-if="customizing.open">
    <div id="options-title-container">
      <div class="options-title-section">
        <img
          :src="require('../../assets/icons/' + customizing.customization.icon)"
          id="options-icon"
          :alt="`${customizing.customization.name} Image`"
        />
        <h1 id="options-title">{{ customizing.customization.name }}</h1>
      </div>
      <h3 id="options-label">
        {{ customizing.customization.description }}
      </h3>
    </div>
    <div id="options-content">
      <div
        v-for="(value, name) in customizing.customization.values"
        v-bind:key="name"
        class="options-value-container"
      >
        <h4 class="options-value-title">
          {{ convertToDisplayableString(name) }}:
        </h4>
        <input
          v-model="customizing.customization.values[name]"
          type="text"
          class="options-input"
          spellcheck="false"
          @change="updateCustomization()"
        />
      </div>
    </div>
  </div>
  <div id="customize-container">
    <div
      class="customization-container"
      v-for="customization in customizations"
      v-bind:key="customization.name"
      :description="customization.description"
    >
      <div class="customization-icon-container">
        <img
          :src="require('../../assets/icons/' + customization.icon)"
          class="customization-icon"
          :alt="`${customization.name} Image`"
        />
      </div>
      <h3 class="customization-name">{{ customization.name }}</h3>
      <button
        class="customization-options-btn"
        v-if="customization.hasOwnProperty('values')"
        @click="toggleCustomizationOptions(customization)"
      >
        OPTIONS
      </button>
      <button
        class="customization-toggle-btn"
        @click="toggleCustomization(customization)"
        v-bind:class="{
          'customization-toggle-btn-disabled': !customization.enabled,
          'customization-toggle-btn-enabled': customization.enabled,
        }"
      >
        {{ customization.enabled ? 'ENABLED' : 'DISABLED' }}
      </button>
    </div>
  </div>
</template>

<script>
import settings from 'electron-settings';
import { updateActivity } from '../../javascript/discord';
import Logger from '../../javascript/logger';
const logger = new Logger('customize');

export default {
  name: 'Patcher',

  data: () => ({
    /** @type {{name: string, description: string, icon: string, internal: string, call?: string, enabled: boolean}[]} */
    customizations: [
      {
        name: 'Freelook & AutoTextHotKey',
        icon: 'freelook.png',
        internal: 'metadata',
        call: 'modSettings',
        enabled: false,
        description: 'Enable Freelook and AutoTextHotKey on Hypixel',
      },
      {
        name: 'Remove Pinned Servers',
        icon: 'pinned_servers.png',
        internal: 'metadata',
        call: 'pinnedServers',
        enabled: false,
        description: 'Remove built-in pinned servers on Lunar Client',
      },
      {
        name: 'Remove Blog Posts',
        icon: 'blogpost.png',
        internal: 'metadata',
        call: 'blogPosts',
        enabled: false,
        description: 'Removes Blog Posts in game',
      },
      {
        name: 'Cloaks+',
        icon: 'cloaks.png',
        internal: 'cloaksPlus',
        enabled: true,
        description:
          'Allows you to use Cloaks+ capes and cosmetics on Lunar client < 1.8 without their loader',
      },
      {
        name: 'Remove Mods Packet',
        icon: 'cog.png',
        internal: 'modpacketRemoval',
        enabled: false,
        description: 'Prevent servers from disabling mods',
      },
      {
        name: 'Nick Hider',
        icon: 'nick_hider.png',
        internal: 'nickhider',
        values: {
          to: 'You',
        },
        enabled: false,
        description:
          'Allows you to change your own IGN, but only you can see it (you can also use colors!)',
      },
      {
        name: 'Lunar Overlays',
        icon: 'themes.png',
        internal: 'supportOverlays',
        enabled: true,
        description: 'Re-enables the ability to use Lunar Client Overlays.',
      },
      {
        name: 'Reach Text',
        icon: 'hit_delay.png',
        internal: 'reachText',
        values: {
          to: 'blocks',
        },
        enabled: false,
        description:
          'Change the Reach Text suffix, eg: 2 blocks, 2 meters, 2 orphans',
      },
      {
        name: 'Uncap Reach Display',
        icon: 'hit_delay.png',
        internal: 'uncapReach',
        enabled: false,
        description: 'Fix reach display in creative mode',
      },
      {
        name: 'Discord RPC',
        icon: 'discord.png',
        internal: 'rpcUpdate',
        values: {
          clientID: '920998351430901790',
          icon: 'logo',
          iconText: 'Solar Tweaks',
          afkText: 'AFK',
          menuText: 'In Menu',
          singlePlayerText: 'Playing Singleplayer',
        },
        enabled: true,
        description:
          "Show what you're doing inside Solar Tweaks in your Discord Rich Presence",
      },
      {
        name: 'Remove Fake Level Head',
        icon: 'hypixel.png',
        internal: 'removeFakeLevelhead',
        enabled: false,
        description:
          'Removes the feature on Lunar which assigns nicked players a random level in their LevelHead',
      },
      {
        name: 'Fix Ping Sound',
        icon: 'pings.png',
        internal: 'fixPings',
        enabled: false,
        description:
          'Fixes the chat mod "Play sound on mention" system to only respond to actual chat messages, not action bars',
      },
      {
        name: 'Remove Hit Delay',
        icon: 'hit_delay.png',
        internal: 'noHitDelay',
        enabled: false,
        description:
          "Makes sure the client doesn't prevent swing/attack packets being sent for no reason",
      },
      {
        name: 'Window Title',
        icon: 'window.png',
        internal: 'windowName',
        values: {
          to: 'Lunar Client (Modded by Solar Tweaks)',
        },
        enabled: true,
        description:
          'Change the name of the Lunar Client Window (NOTE: If you are planning to inject cheats into your game, turn this module off)',
      },
      {
        name: 'Privacy',
        icon: 'privacy.png',
        internal: 'websocketPrivacy',
        privacyModules: ['tasklistPrivacy', 'hostslistPrivacy'],
        enabled: false,
        description:
          'Prevent Lunar Client from sending data about your computer to their servers',
      },
      {
        name: 'Level Head',
        icon: 'hypixel.png',
        internal: 'levelHead',
        values: {
          to: 'Level',
        },
        enabled: false,
        description: 'Change the levelhead prefix',
      },
      {
        name: 'Toggle Sprint Texts',
        icon: 'toggle_sprint.png',
        internal: 'toggleSprintText',
        values: {
          flying: 'flying',
          riding: 'riding',
          descending: 'descending',
          dismounting: 'dismounting',
          sneaking: 'sneaking',
          sprinting: 'sprinting',
        },
        special: 'toggleSprintText',
        enabled: false,
        description: 'Change the text that toggle sprint says',
      },
      {
        name: 'FPS Spoof',
        icon: 'fps.png',
        internal: 'fpsSpoof',
        values: {
          multiplier: 2.0,
        },
        enabled: false,
        description: 'Multiply your FPS counter',
      },
      {
        name: 'FPS',
        icon: 'fps.png',
        internal: 'fps',
        values: {
          to: 'FPS',
        },
        enabled: false,
        description: 'Change the FPS Text',
      },
      {
        name: 'CPS',
        icon: 'cps.png',
        internal: 'cps',
        values: {
          to: 'CPS',
        },
        enabled: false,
        description: 'Change the CPS Text',
      },
      {
        name: 'Auto GG',
        icon: 'hypixel.png',
        internal: 'autoGG',
        values: {
          to: '/achat gg',
        },
        enabled: false,
        description:
          'Change the command sent by auto gg at the end of every game',
      },
      {
        name: 'Remove hashing',
        icon: 'hash.png',
        internal: 'removeHashing',
        enabled: false,
        description:
          'Speed up the loading of Lunar Client on lower end computers',
      },
      {
        name: 'Options in Singleplayer',
        icon: 'cog.png',
        internal: 'lunarOptions',
        enabled: false,
        description:
          'Removes the Open to LAN button and replaces it with the Lunar Options button',
      },
      {
        name: 'Toggle Sneak in Container',
        icon: 'toggle_sprint.png',
        internal: 'toggleSneakContainer',
        enabled: false,
        description: 'Allows you to use toggle sneak while in a container',
      },
      {
        name: 'Change ping text',
        icon: 'ping.png',
        internal: 'pingText',
        values: {
          to: 'ms',
        },
        enabled: false,
        description: 'Change the text of the ping mod',
      },
      {
        name: 'Change ping value',
        icon: 'ping.png',
        internal: 'pingSpoof',
        values: {
          pingValue: '100',
        },
        enabled: false,
        description: 'Change the text of the ping mod',
      },
      {
        name: 'Always render cloth cloaks',
        icon: 'cloak.png',
        internal: 'clothCapes',
        enabled: false,
        description:
          'Enables cloth capes for all capes on all players (only for you)',
      },
      {
        name: 'Adjust hurt cam',
        icon: 'toggle_sprint.png',
        internal: 'hurtCamShake',
        values: {
          multiplier: 0.3,
        },
        enabled: false,
        description: 'Change the hurt cam shake effect multiplier',
      },
      {
        name: 'Remove chat limit',
        icon: 'chat.png',
        internal: 'chatLimit',
        values: {
          limit: 255,
        },
        enabled: false,
        description: 'Set the maximum chat limit count to a preset value',
      },
      {
        name: 'Remove Lunar chat cooldown',
        icon: 'chat.png',
        internal: 'removeChatDelay',
        enabled: true,
        description: 'Remove the client-side chat delay in the friends tab',
      },
      {
        name: 'Mumble fix',
        icon: 'mumble.png',
        internal: 'mumbleFix',
        enabled: false,
        description: 'Allow mumblelink on Linux, but is not recommended to use',
      },
      {
        name: 'Websocket',
        icon: 'websocket.png',
        internal: 'websocket',
        values: {
          to: 'wss://assetserver.lunarclientprod.com/connect',
        },
        enabled: false,
        description: 'Change the Lunar Client asset websocket URL',
      },
      {
        name: 'Show wrapped',
        icon: 'wrapped.png',
        internal: 'enableWrapped',
        enabled: false,
        description:
          'Re-enable Lunar Client Wrapped, useful for people that still want to view it',
      },
    ],
    customizing: {
      open: false,
      customization: {
        values: {},
      },
    },
  }),

  methods: {
    /**
     * Make letter of each word uppercase and replace underscores with spaces
     * Credits to GitHub copilot for this one
     * @param {string} str String to convert
     */
    convertToDisplayableString(str) {
      if (str === 'to') return 'Text';
      return str
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },

    /**
     * Toggle a customization
     * @param {Object} customization The customization to toggle
     */
    async toggleCustomization(customization) {
      customization.enabled = !customization.enabled;
      logger.debug(
        `${customization.name} is now ${
          customization.enabled ? 'enabled' : 'disabled'
        } with value${
          Object.keys(customization.values).length > 1 ? 's' : ''
        } ${Object.values(customization.values).join(', ')}`
      );
      await this.writeCustomizations();
    },

    /**
     * Toggle the customization options popup
     */
    toggleCustomizationOptions(customization) {
      this.customizing.open = !this.customizing.open;
      this.customizing.customization = customization;
    },

    /**
     * Update customization value
     */
    async updateCustomization() {
      this.customizations.find(
        (customizations) =>
          customizations.name === this.customizing.customization.name
      ).value = this.customizing.customization.value;
      const customization = this.customizations.find(
        (customizations) =>
          customizations.name === this.customizing.customization.name
      );
      logger.debug(
        `${customization.name} is now ${
          customization.enabled ? 'enabled' : 'disabled'
        } with value${
          Object.keys(customization.values).length > 1 ? 's' : ''
        } ${Object.values(customization.values).join(', ')}`
      );
      await this.writeCustomizations();
    },

    /**
     * Write customizations to settings
     */
    async writeCustomizations() {
      const customizations = [];
      this.customizations.forEach((customization) => {
        customizations.push({
          name: customization.name,
          internal: customization.internal,
          values: customization.values,
          privacyModules: customization.privacyModules,
          call: customization.call,
          enabled: customization.enabled,
        });
      });
      await settings.set('customizations', customizations);
    },
  },

  async beforeMount() {
    // Loads enabled customizations from settings
    const customizations = await settings.get('customizations');
    logger.info('Loading customizations from settings');
    if (customizations) {
      customizations.forEach((savedCustomization) => {
        // Privacy module
        if (
          Object.prototype.hasOwnProperty.call(
            savedCustomization,
            'privacyModules'
          )
        ) {
          const privacyModule = this.customizations.find((c) =>
            Object.prototype.hasOwnProperty.call(c, 'privacyModules')
          );
          if (privacyModule) privacyModule.enabled = savedCustomization.enabled;
          return;
        }
        this.customizations.forEach((customization) => {
          if (customization.name === savedCustomization.name) {
            customization.enabled = savedCustomization.enabled;
            if (Object.keys(customization).includes('values'))
              for (const key in customization.values)
                customization.values[key] = savedCustomization.values[key];
          }
        });
      });
    }
    updateActivity('In the launcher', 'Customizing the game');
  },

  unmounted() {
    if (!this.$store.getters.isLaunching) {
      updateActivity('In the launcher');
    }
  },
};
</script>

<style scoped>
#options-background-filter {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  height: 80%;
  width: 100%;
  top: 110px;
  z-index: 100;
}

#options-container {
  position: fixed;
  background-color: #181818;
  height: fit-content;
  z-index: 100;
  width: 70%;
  overflow: hidden;
  left: calc((50vw - 50%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border: 2px #1f1f1f solid;
  border-radius: 15px;
}

#options-title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 40px 25px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), #181818),
    url('../../assets/cards-backgrounds/patcher.webp');
  background-size: cover;
  background-position: center;
}

.options-title-section {
  display: flex;
}

#options-icon {
  height: 45px;
  width: 45px;
  margin-right: 20px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.5));
}

#options-title {
  letter-spacing: 2px;
  font-weight: 600;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
}

#options-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
}

#options-label {
  font-weight: 400;
  letter-spacing: 0.5px;
  width: 600px;
  text-align: center;
  color: #c8c8c8;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
}

.options-value-container {
  display: flex;
  align-items: center;
}

.options-value-title {
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.5px;
  font-size: 18px;
  margin-right: 20px;
}

.options-input {
  border: none;
  background-color: #0f0f0f;
  outline: none;
  height: 30px;
  width: 450px;
  margin: 10px 0;
  font-size: 20px;
  color: #505050;
  font-weight: 600;
  padding: 10px 15px;
  text-align: center;
  border-radius: 5px;
}

::-webkit-scrollbar {
  width: 8px;
  display: flex;
}

::-webkit-scrollbar-thumb {
  height: 50px;
  background-color: #424140;
}

#customize-container {
  display: grid;
  grid-template-columns: repeat(4, 250px);
  grid-template-rows: repeat(2, 250px);
  grid-column-gap: 35px;
  grid-row-gap: 30px;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 75px;
}

.customization-container {
  background-color: #232324;
  width: 250px;
  height: 250px;
  border-radius: 20px;
  border: 3px solid #30323456;
  transition: background-color 0.5s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.customization-container:hover {
  background-color: rgba(77, 80, 83, 0.337);
}

.customization-container::before {
  content: attr(description);
  opacity: 0;
  width: 100%;
  color: #f7f7f783;
  font-weight: 400;
  letter-spacing: 0.2px;
  text-align: center;
  padding: 0 0px;
  transition: opacity 0.25s ease;
  position: absolute;
  left: 0;
  top: 48%;
  font-size: 0.75em;
}
.customization-container:hover::before {
  opacity: 1;
}

.customization-icon-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: auto;
  margin-top: 25px;
}

.customization-icon {
  -webkit-user-drag: none;
  width: 70px;
  height: 70px;
  margin-left: auto;
  margin-right: auto;
}

.customization-name {
  text-align: center;
  font-weight: 400;
  margin-top: 25px;
  color: #f7f7f783;
  font-size: 20px;
  opacity: 1;
  transition: opacity 0.25s ease-in-out;
}

.customization-container:hover .customization-name {
  opacity: 0;
}

.customization-toggle-btn {
  width: 100%;
  height: 50px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  font-size: 15px;
  letter-spacing: 5px;
  font-weight: 500;
  position: absolute;
  bottom: 0;
  cursor: pointer;
}

.customization-toggle-btn-disabled {
  background-color: #a22143;
  border: 2px solid #b5506b;
  transition: background-color 0.3s, border 0.3s;
}

.customization-toggle-btn-disabled:hover {
  background-color: #de2152;
}

.customization-toggle-btn-enabled {
  background-color: #269d5f;
  border: 2px solid #53b180;
  transition: background-color 0.3s, border 0.3s;
}

.customization-toggle-btn-enabled:hover {
  background-color: #28c873;
}

.customization-options-btn {
  background-color: #5858587a;
  width: 100%;
  height: 40px;
  border: 2px solid #5858587a;
  margin-top: 16px;
  font-weight: 500;
  letter-spacing: 5px;
  font-size: 15px;
  transition: background-color 0.3s, border 0.3s;
  cursor: pointer;
}

.customization-options-btn:hover {
  background-color: #6b6b6b7a;
  border: 2px solid #6b6b6b7a;
}
</style>
