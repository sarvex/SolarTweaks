<template>
  <div
    id="options-background-filter"
    @click="toggleMenu()"
    v-if="menu.open"
  ></div>
  <div id="options-container" v-if="menu.open && menu.type === 'module'">
    <div id="options-title-container">
      <div class="options-title-section">
        <img
          :src="`https://raw.githubusercontent.com/Solar-Tweaks/Engine-Icons/main/${menu.module.name}.png`"
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
        ></button>
      </div>
    </div>
  </div>
  <div
    id="options-container"
    v-if="menu.open && menu.type === 'customCommands'"
  >
    <div id="options-title-container">
      <div class="options-title-section">
        <img
          src="https://raw.githubusercontent.com/Solar-Tweaks/Engine-Icons/main/customCommands.png"
          id="options-icon-custom-commands"
          alt="Command Aliases Image"
        />
        <h1 id="options-title">Command Aliases</h1>
      </div>
      <h3 id="options-label">
        Create aliases for commands in-game<br /><small
          style="color: var(--color-red-hover)"
          >NOTE: Aliases (the text boxes on the left) cannot contain spaces or
          any other characters that are disallowed in commands</small
        >
      </h3>
    </div>
    <div id="options-content">
      <div id="custom-commands" @click="highlightedCommand = null">
        <div
          class="custom-command"
          v-for="customCommand of Object.keys(customCommands)"
          v-bind:key="customCommand"
          v-bind:class="{
            'custom-command-highlighted': highlightedCommand == customCommand,
          }"
          v-on:click.stop="highlightedCommand = customCommand"
        >
          <input
            type="text"
            class="custom-command-name"
            spellcheck="false"
            :value="'/' + customCommand"
            @change="
              (event) => {
                if (verifyCommand(event.target.value, false))
                  changeCommandName(customCommand, event.target.value);
              }
            "
          />
          <input
            type="text"
            class="custom-command-name"
            spellcheck="false"
            @change="
              (event) => {
                if (verifyCommand(event.target.value, true))
                  customCommands[customCommand] = event.target.value;
              }
            "
            :value="customCommands[customCommand]"
          />
        </div>
      </div>
      <button
        id="add-command"
        @click="addCommand()"
        class="fa-solid fa-plus add-or-remove-command"
      ></button>
      <button
        id="remove-command"
        @click="removeCommand()"
        class="fa-solid fa-minus add-or-remove-command"
      ></button>
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
          :src="`https://raw.githubusercontent.com/Solar-Tweaks/Engine-Icons/main/${item.name}.png`"
          class="customization-icon"
          :alt="`${item.name} Image`"
        />
      </div>
      <h3 class="customization-name">{{ item.displayName }}</h3>
      <button
        class="customization-options-btn"
        v-if="Object.keys(item.options).length"
        @click="toggleMenu(item.name)"
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
    <div
      class="customization-container"
      description="Create shortcuts to run certain commands in-game"
    >
      <div class="customization-icon-container">
        <img
          src="https://raw.githubusercontent.com/Solar-Tweaks/Engine-Icons/main/customCommands.png"
          class="customization-icon"
          alt="Command Aliases Image"
        />
      </div>
      <h3 class="customization-name">Command Aliases</h3>
      <button class="custom-commands-edit-btn" @click="toggleMenu()">
        EDIT
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
    /** @type {{[command: string]: string}} */
    customCommands: {},
    /** @type {string} */
    highlightedCommand: null,
    menu: {
      open: false,
      /** @type {"module" | "customCommands"} */
      type: null,
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

    async toggleMenu(module) {
      this.highlightedCommand = null;
      if (this.inDepth.open) this.toggleOptionInDepth();
      this.menu.open = !this.menu.open;
      if (!this.menu.open && this.menu.type === 'module') this.updateModule();
      if (this.menu.open) {
        if (module) {
          this.menu.module = this.modules[module];
          this.menu.type = 'module';
        } else {
          this.menu.module = {
            options: {},
          };
          this.menu.type = 'customCommands';
        }
      } else {
        this.menu.module = {
          options: {},
        };
        this.menu.type = null;
      }

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
      data = {
        modules: data,
        customCommands: {
          commands: this.customCommands,
        },
      };
      console.log('Saving Settings', data);
      await writeFile(
        join(constants.SOLARTWEAKS_DIR, constants.ENGINE.CONFIG),
        JSON.stringify(data),
        'utf-8'
      );
    },

    addCommand() {
      let commandName = 'test';
      let num = 1;
      while (this.customCommands[commandName]) {
        commandName = 'test' + num;
        num += 1;
      }
      this.customCommands[commandName] = '/ac gg';
    },

    removeCommand() {
      if (!this.highlightedCommand) return;
      delete this.customCommands[this.highlightedCommand];
      this.highlightedCommand = null;
    },

    changeCommandName(oldName, newName) {
      newName = newName.replace(/\//g, '');
      if (this.customCommands[newName]) return;
      const value = this.customCommands[oldName];
      delete this.customCommands[oldName];
      this.customCommands[newName] = value;
    },

    verifyCommand(cmd, real) {
      if (real) return /^[A-Za-z0-9_/ ]+$/.test(cmd);
      else return /^[A-Za-z0-9_/]+$/.test(cmd);
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
    );
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
    );
    for (const module in data.modules) {
      if (!this.modules[module]) continue;
      this.modules[module].enabled = data.modules[module].isEnabled ?? false;
      for (const option in data.modules[module]) {
        if (option === 'isEnabled') continue;
        if (!this.modules[module].options[option]) continue;
        this.modules[module].options[option].value =
          data.modules[module][option];
      }
    }
    for (const module in example.modules) {
      if (!this.modules[module] || this.modules[module].enabled !== undefined)
        continue;
      this.modules[module].enabled = example.modules[module].isEnabled ?? false;
      for (const option in example.modules[module]) {
        if (option === 'isEnabled') continue;
        if (!this.modules[module].options[option]) continue;
        this.modules[module].options[option].value =
          example.modules[module][option];
      }
    }
    for (const module in this.modules) {
      this.modules[module].name = module;
      for (const option in this.modules[module].options)
        this.modules[module].options[option].name = option;
    }
    this.customCommands =
      data.customCommands?.commands || example.customCommands?.commands;
  },

  async beforeUnmount() {
    if (!this.$store.getters.isLaunching) updateActivity('In the launcher');
    await this.saveModules();
  },
};
</script>

<style scoped lang="scss">
::-webkit-scrollbar {
  width: 5px;
  display: flex;
}

::-webkit-scrollbar-thumb {
  border-radius: 999rem;
  background-color: #424140;
}

#options-background-filter {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(0.5rem);
  height: 100vh;
  width: 100%;
  top: 0;
  z-index: 2;
}

#options-container {
  position: fixed;
  background-color: var(--color-background);
  height: fit-content;
  z-index: 100;
  width: 60%;
  overflow: hidden;
  left: calc((50vw - 50%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border-radius: 15px;
}

#options-title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
  padding: 40px 25px;
  background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      var(--color-background)
    ),
    url('../../assets/cards-backgrounds/about.png');
  background-size: cover;
  background-position: center;
}

.options-title-section {
  display: flex;
  align-items: center;
}

#options-icon {
  height: 40px;
  width: 40px;
  margin-right: 20px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.5));
}

#options-title {
  font-size: 2rem;
  font-family: var(--font-secondary);
  letter-spacing: 2px;
  font-weight: 600;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
}

#options-content {
  position: relative;
  overflow-y: scroll;
  height: 250px;
  display: flex;
  flex-direction: column;
  padding: 25px 20px;
  align-items: center;
}

#options-label {
  font-weight: 400;
  letter-spacing: 0.5px;
  width: 600px;
  text-align: center;
  color: #c9c9c9;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
}

.options-value-container {
  display: flex;
  align-items: center;
  text-align: left;
  justify-content: left;
}

.options-value-title {
  display: flex;
  align-items: center;
  justify-content: left;
  text-align: left;
  font-weight: 500;
  width: 200px;
  color: var(--color-text);
  inline-size: 165px;
  letter-spacing: 0.5px;
  font-size: 18px;
  margin-right: 20px;
}

.options-input {
  border: none;
  background-color: var(--color-darker-gray);
  outline: none;
  height: 30px;
  width: 450px;
  margin: 7px 0;
  font-size: 16px;
  color: var(--engine-color-text);
  font-weight: 600;
  padding: 10px 15px;
  text-align: center;
  border-radius: 5px;
}

.options-toggle {
  display: flex;
  justify-content: center;
  margin: 18px 33px 18px 0;
  align-items: center;
  height: 30px;
  width: 450px;
  border-radius: 5px;
  background: none;
  padding: 10px 15px;
  text-shadow: var(--text-shadow);
  outline: none;
  cursor: pointer;
  font-weight: 550;
}

.options-toggle::before {
  position: absolute;
  padding: 15px 44px;
  content: '';
  background-color: var(--color-darker-gray);
  border-radius: 5px;
}

.options-toggle::after {
  transition: left 0.15s ease;
}

.options-toggle-enabled {
  border: none;
}

.options-toggle-enabled::after {
  position: relative;
  padding: 2px 10px;
  content: 'ON';
  background: var(--color-green);
  box-shadow: 0 0 0 2px var(--color-green-outline);
  border-radius: 2.5px;
  left: 20px;
}

.options-toggle-disabled {
  border: none;
}

.options-toggle-disabled::after {
  position: relative;
  padding: 2px 10px;
  content: 'OFF';
  background: var(--color-gray);
  box-shadow: 0 0 0 2px var(--color-gray-outline);
  border-radius: 2.5px;
  left: -17px;
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
  grid-column-gap: 15px;
  grid-row-gap: 15px;
  justify-content: center;
  margin-top: 15px;
  margin-bottom: 75px;
}

.customization-container {
  background-color: var(--card-background);
  width: 250px;
  height: 250px;
  border-radius: 20px;
  transition: background-color 0.15s;
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.customization-container:hover {
  background-color: var(--engine-card-hover);
}
.customization-container::before {
  content: attr(description);
  opacity: 0;
  width: 225px;
  color: var(--color-text);
  font-weight: 400;
  letter-spacing: 0.2px;
  text-align: center;
  padding: 0 0px;
  transition: opacity 0.15s ease;
  position: absolute;
  left: 12.5px;
  top: 42.5%;
  font-size: 0.75em;
}
.customization-container:hover::before {
  opacity: 1;
}

.customization-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: var(--icon-color);
  height: 70px;
  width: 70px;
  justify-content: center;
  margin-top: 25px;
}

.customization-icon {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  -webkit-user-drag: none;
  width: 100%;
  height: auto;
  margin-left: auto;
  margin-right: auto;
}

.customization-name {
  text-align: center;
  margin: 13px auto;
  font-size: 1.2rem;
  font-weight: 500;
  letter-spacing: -0.25px;
  color: var(--color-dark-text);
  transition: 0.25s ease;
}

.customization-container:hover .customization-name {
  opacity: 0;
}

.customization-toggle-btn {
  width: 100%;
  height: 50px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  text-shadow: var(--text-shadow);
  color: var(--color-text);
  font-size: 15px;
  letter-spacing: 5px;
  font-weight: 600;
  position: absolute;
  bottom: 0;
  cursor: pointer;
}

.customization-toggle-btn-disabled {
  background-color: var(--color-dark-gray);
  border: none;
  transition: background-color 0.3s, color 0.3s;
}

.customization-toggle-btn-disabled:hover {
  color: white;
  background-color: var(--color-gray);
}

.customization-toggle-btn-enabled {
  color: white;
  background-color: var(--color-green);
  border: none;
  transition: background-color 0.3s;
}

.customization-toggle-btn-enabled:hover {
  box-shadow: 0 0 0 2px var(--color-green-outline);
  background-color: var(--color-green-hover);
}

.customization-options-btn {
  background-color: var(--color-darker-gray);
  width: 100%;
  height: 40px;
  font-weight: 700;
  text-shadow: var(--text-shadow);
  opacity: 0.8;
  color: var(--color-text);
  border: none;
  margin-top: 16px;
  letter-spacing: 5px;
  font-size: 15px;
  transition: color 0.3s;
  cursor: pointer;
}

.customization-options-btn:hover {
  opacity: 0.5;
}

#option-indepth-container {
  position: fixed;
  background-color: var(--color-darker-gray);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 10px;
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  -webkit-transform: perspective(1px) scale3d(1, 1, 1);
  transform: perspective(1px) scale3d(1, 1, 1);
  z-index: 100;
  right: 50%;
  top: calc((50vh - 85%) * -1);
  transform: translate(50%, calc(50vh - 50%));
  text-shadow: var(--short-text-shadow);
  border-radius: 0.5rem;
  text-align: center;
  padding: 10px 20px;
}

#option-indepth-name {
  text-align: center;
  letter-spacing: 2px;
  font-style: italic;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--color-green);
  font-size: 0.95rem;
}
#option-indepth-description {
  font-weight: 400;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: var(--color-text);
  text-align: center;
}

.custom-commands-edit-btn {
  width: 100%;
  height: 50px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  text-shadow: var(--text-shadow);
  color: var(--color-text);
  font-size: 15px;
  letter-spacing: 5px;
  font-weight: 600;
  position: absolute;
  bottom: 0;
  cursor: pointer;
  background-color: var(--color-ultra-blue);
  border: none;
  transition: background-color 0.3s;
  color: white;
}
.custom-commands-edit-btn:hover {
  box-shadow: 0 0 0 2px var(--color-ultra-blue);
  background-color: var(--color-ultra-blue-hover);
}
#options-icon-custom-commands {
  width: 80px;
  margin-right: 20px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.5));
}
.add-or-remove-command {
  background-color: var(--color-dark-gray);
  border: none;
  padding: 7.5px 20px;
  border-radius: 10px;
  font-size: 1.2rem;
  position: absolute;
  bottom: 10px;
  transition: background-color 0.2s ease-in-out;
}
.add-or-remove-command:hover {
  background-color: var(--color-darker-gray);
}
#add-command {
  left: 20px;
}
#remove-command {
  left: 85px;
}
#custom-commands {
  background-color: var(--tooltip-background);
  border-radius: 15px;
  width: 100%;
  height: 95%;
  margin: -15px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
}
.custom-command {
  background-color: var(--color-darker-gray);
  display: flex;
}
.custom-command > input {
  transition: background-color 0.1s ease-in-out;
}
.custom-command:first-child > input {
  padding-top: 15px;
}
.custom-command:last-child > input {
  padding-bottom: 15px;
}
.custom-command-highlighted > input {
  background-color: var(--color-gray);
}
.custom-command-name {
  border: none;
  background-color: var(--color-darker-gray);
  outline: none;
  width: 50%;
  font-size: 16px;
  color: var(--engine-color-text);
  font-weight: 600;
  padding: 10px 15px;
  text-align: center;
}
.custom-command-cmd {
  right: 20px;
  border-left: 2px solid white;
  padding: 0px 10px;
  width: 50%;
}
</style>
