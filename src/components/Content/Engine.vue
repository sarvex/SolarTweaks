<template>
  <div
    id="options-background-filter"
    @click="toggleModuleMenu()"
    v-if="menu.open"
  ></div>
  <div id="options-container" v-if="menu.open">
    <div id="options-title-container">
      <div class="options-title-section">
        <img
          :src="
            (() => {
              try {
                return require('../../assets/icons/' +
                  menu.module.name +
                  '.png');
              } catch {
                return '';
              }
            })()
          "
          id="options-icon"
          :alt="`${menu.module.name} Image`"
        />
        <h1 id="options-title">{{ menu.module.displayName }}</h1>
      </div>
      <h3 id="options-label">
        {{ menu.module.description }}
      </h3>
    </div>
    <div id="options-content">
      <div
        v-for="option in menu.module.options"
        v-bind:key="option.name"
        class="options-value-container"
      >
        <h4
          class="options-value-title"
          @mouseover="toggleOptionInDepth(option.name)"
          @mouseleave="toggleOptionInDepth()"
        >
          {{ option.displayName }}:
        </h4>
        <input
          v-if="
            option.type == 'STRING' ||
            option.type == 'FLOAT' ||
            option.type == 'INTEGER'
          "
          v-model="menu.module.options[option.name].value"
          type="text"
          class="options-input"
          spellcheck="false"
          @change="updateModule()"
        />
        <button
          v-else-if="option.type == 'BOOLEAN'"
          class="options-toggle"
          v-bind:class="{
            'options-toggle-enabled': menu.module.options[option.name].value,
            'options-toggle-disabled': !menu.module.options[option.name].value,
          }"
          @click="
            menu.module.options[option.name].value =
              !menu.module.options[option.name].value
          "
        >
          {{ menu.module.options[option.name].value ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>
  </div>
  <div id="option-indepth-container" v-if="inDepth.open">
    <h1 id="option-indepth-name">{{ inDepth.displayName }}</h1>
    <p id="option-indepth-description">{{ inDepth.description }}</p>
  </div>
  <div id="customize-container">
    <div
      class="customization-container"
      v-for="item of modules"
      v-bind:key="item.name"
      :description="item.description"
    >
      <div class="customization-icon-container">
        <img
          :src="
            (() => {
              try {
                return require('../../assets/icons/' + item.name + '.png');
              } catch {
                return '';
              }
            })()
          "
          class="customization-icon"
          :alt="`${item.name} Image`"
        />
      </div>
      <h3 class="customization-name">{{ item.displayName }}</h3>
      <button
        class="customization-options-btn"
        v-if="Object.keys(item.options).length"
        @click="toggleModuleMenu(item.name)"
      >
        OPTIONS
      </button>
      <button
        class="customization-toggle-btn"
        @click="toggleModule(item.name)"
        v-bind:class="{
          'customization-toggle-btn-disabled': !item.enabled,
          'customization-toggle-btn-enabled': item.enabled,
        }"
      >
        {{ item.enabled ? 'ENABLED' : 'DISABLED' }}
      </button>
    </div>
  </div>
</template>

<script>
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import constants from '../../constants';
import { updateActivity } from '../../javascript/discord';
import { downloadAndSaveFile } from '../../javascript/downloader';
// import Logger from '../../javascript/logger';

// const logger = new Logger('customize');

/** @typedef {{options: {[name: string]: {value?: any; name: string; type: "STRING" | "BOOLEAN" | "INTEGER" | "FLOAT"; displayName: string; description: string}}; displayName: string; description: string; enabled?: boolean; name: string;}} Module */

export default {
  name: 'Engine',

  data: () => ({
    /** @type {{[name: string]: Module}} */
    modules: {},
    menu: {
      open: false,
      /** @type {Module} */
      module: {
        options: {},
      },
    },
    inDepth: {
      open: false,
      name: '',
      displayName: '',
      description: '',
    },
  }),

  methods: {
    toggleOptionInDepth(name) {
      if (this.inDepth.open && !(name && name !== this.inDepth.name)) {
        this.inDepth.open = false;
        this.inDepth.name = '';
        this.inDepth.displayName = '';
        this.inDepth.description = '';
      } else {
        this.inDepth.open = true;
        const option = this.menu?.module?.options?.[name];
        if (!option) {
          console.error(
            `Unable to find option ${name} in`,
            this.menu?.module?.options
          );
          return this.toggleOptionInDepth();
        }
        this.inDepth.name = option.name;
        this.inDepth.displayName = option.displayName;
        this.inDepth.description = option.description;
      }
    },

    async toggleModule(module) {
      this.modules[module].enabled = !this.modules[module].enabled;
      await this.saveModules();
    },

    async toggleModuleMenu(module) {
      if (this.inDepth.open) this.toggleOptionInDepth();
      this.menu.open = !this.menu.open;
      if (!this.menu.open) this.updateModule();
      if (module) this.menu.module = this.modules[module];
      else
        this.menu.module = {
          options: {},
        };
      await this.saveModules();
    },

    updateModule() {
      this.modules[this.menu.module.name] = this.menu.module;
    },

    async saveModules() {
      let data = {};
      for (const module in this.modules) {
        data[module] = {
          isEnabled: !!this.modules[module].enabled,
        };
        for (const option in this.modules[module].options)
          data[module][option] = this.modules[module].options[option].value;
      }
      data = { modules: data };
      console.log('Saving Settings', data);
      await writeFile(
        join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG),
        JSON.stringify(data),
        'utf-8'
      );
    },
  },

  async beforeMount() {
    updateActivity('In the launcher', 'Customizing the game');
    this.modules = JSON.parse(
      await readFile(
        join(constants.SOLARTWEAKS_DIR, constants.ENGINE.METADATA),
        'utf-8'
      ).catch(
        async () =>
          await downloadAndSaveFile(
            constants.ENGINE.METADATA_URL,
            join(constants.SOLARTWEAKS_DIR, constants.ENGINE.METADATA),
            'text',
            '',
            '',
            true
          ).then(() =>
            readFile(
              join(constants.SOLARTWEAKS_DIR, constants.ENGINE.METADATA),
              'utf-8'
            )
          )
      )
    ).modules;
    const example = JSON.parse(
      await readFile(
        join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG_EXAMPLE),
        'utf-8'
      ).catch(
        async () =>
          await downloadAndSaveFile(
            constants.ENGINE.CONFIG_EXAMPLE_URL,
            join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG_EXAMPLE),
            'text',
            '',
            '',
            true
          )
            .then(() =>
              readFile(
                join(
                  constants.SOLARTWEAKS_DIR,
                  constants.ENGINE.CONFIG_EXAMPLE
                ),
                'utf-8'
              )
            )
            .catch(() => ({}))
      )
    ).modules;
    const data = JSON.parse(
      await readFile(
        join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG),
        'utf-8'
      ).catch(
        async () =>
          await writeFile(
            join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG),
            '{}'
          )
            .then(() => ({}))
            .catch(() => ({}))
      )
    ).modules;
    for (const module in data) {
      if (!this.modules[module]) continue;
      this.modules[module].enabled = data[module].isEnabled ?? false;
      for (const option in data[module]) {
        if (option === 'isEnabled') continue;
        if (!this.modules[module].options[option]) continue;
        this.modules[module].options[option].value = data[module][option];
      }
    }
    for (const module in example) {
      if (!this.modules[module] || this.modules[module].enabled !== undefined)
        continue;
      this.modules[module].enabled = example[module].isEnabled ?? false;
      for (const option in example[module]) {
        if (option === 'isEnabled') continue;
        if (!this.modules[module].options[option]) continue;
        this.modules[module].options[option].value = example[module][option];
      }
    }
    for (const module in this.modules) {
      this.modules[module].name = module;
      for (const option in this.modules[module].options)
        this.modules[module].options[option].name = option;
    }
  },

  async beforeUnmount() {
    if (!this.$store.getters.isLaunching) updateActivity('In the launcher');
    await this.saveModules();
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
  width: 60%;
  overflow: hidden;
  left: calc((50vw - 35%) * -1);
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
    url('../../assets/cards-backgrounds/engine.webp');
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
  margin: 7px 0;
  font-size: 20px;
  color: #c7c7c7;
  font-weight: 600;
  padding: 10px 15px;
  text-align: center;
  border-radius: 5px;
}

.options-toggle {
  margin: 5px 0;
  align-items: center;
  width: 80px;
  height: 25px;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  font-weight: 550;
  transition: background 0.5s ease;
  transition: border 0.2s ease-out;
}

.options-toggle-enabled {
  background: #269d5f;
  border: 2px solid #53b180;
}
.options-toggle-disabled {
  background: #a22143;
  border: 2px solid #b5506b;
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
  background-color: rgba(77, 80, 83, 0.297);
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
  font-size: 19.5px;
  text-overflow: ellipsis;
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

#option-indepth-container {
  position: fixed;
  background-color: #181818;
  height: fit-content;
  z-index: 100;
  width: 26.5%;
  overflow: hidden;
  right: calc((50vw - 88.75%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border: 2px #1f1f1f solid;
  border-radius: 15px;
  text-align: center;
  padding: 50px 10px;
  padding-top: 40px;
}

#option-indepth-name {
  letter-spacing: 0.8px;
  margin-bottom: 30px;
}
#option-indepth-description {
  word-break: break-all;
}
</style>
