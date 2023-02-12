<template>
  <div id="settings-container">
    <Card
      icon="fa-solid fa-cogs"
      title="GAME & LAUNCHER SETTINGS"
      subtitle="CUSTOMIZE LAUNCHER BEHAVIOR"
      background="settings-1"
      class="settings-card"
      contentClass="horizontal-card-container"
    >
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-regular fa-folder-open"
          title="Launch Directories"
          subtitle="Select which directory to launch Minecraft from"
          class="directories-card-item"
          contentClass="directories-card-item-content"
        >
          <div id="settings-directories">
            <div
              class="settings-directories-item"
              v-for="directory in directories"
              v-bind:key="directory.version"
            >
              <span class="settings-directories-item-version">{{
                directory.version
              }}</span>
              <input
                type="text"
                class="input settings-directories-input"
                v-model="directory.path"
                @click="setNewDirectory(directory.version)"
              />
            </div>
            <button
              id="directory-reset-button"
              class="button"
              @click="resetLaunchDirectories()"
            >
              <i class="fa-solid fa-arrow-rotate-right button-icon"></i>
              <span class="button-text">Reset to default</span>
            </button>
          </div>
        </CardItem>
      </div>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-sliders"
          title="Allocated Memory"
          subtitle="Memory allocated towards the game"
          class="settings-card-little"
        >
          <div id="settings-ram">
            <input
              type="range"
              :min="ram.minimum"
              :max="ram.maximum"
              v-model="ram.current"
              step="256"
              class="slider"
              id="settings-ram-slider"
              @change="updateRam()"
            />
            <div id="settings-ram-values-container">
              <span id="settings-ram-value"
                >{{ ram.current }} MB ALLOCATED</span
              >
              <br />
              <span id="settings-ram-indicator"
                >YOU HAVE {{ Math.round(ram.maximum - ram.current) }} MB LEFT TO
                ALLOCATE</span
              >
            </div>
          </div>
        </CardItem>
        <CardItem
          icon="fa-solid fa-compress"
          title="Resolution"
          subtitle="Enter a resolution to launch your game in"
          class="settings-card-little"
        >
          <div id="settings-resolution">
            <div id="settings-resolution-left">
              <div class="settings-resolution-title">
                <i class="fa-solid fa-text-width settings-resolution-icon"></i>
                <span>Width</span>
              </div>
              <input
                type="number"
                class="settings-resolution-input"
                placeholder="854"
                v-model="resolution.width"
                @change="updateResolution()"
              />
            </div>
            <div id="settings-resolution-middle"><br /><br />X</div>
            <div id="settings-resolution-right">
              <div class="settings-resolution-title">
                <i class="fa-solid fa-text-height settings-resolution-icon"></i>
                <span>Height</span>
              </div>
              <input
                type="number"
                class="settings-resolution-input"
                placeholder="480"
                v-model="resolution.height"
                @change="updateResolution()"
              />
            </div>
          </div>
        </CardItem>
      </div>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-angles-left"
          title="Before Launch"
          subtitle="Select what to do before launching Minecraft"
          class="settings-card-little"
        >
          <div id="settings-before-launch-container">
            <div class="settings-before-launch">
              <div :style="`display: flex; flex-direction: row;`">
                <input
                  type="checkbox"
                  id="settings-skip-checks-input"
                  v-model="skipChecks"
                  @change="updateSkipChecks()"
                />
                <span id="settings-before-launch-text"
                  >Skip checks (game files, JRE, licenses, natives and assets)
                </span>
              </div>
              <span class="settings-debug-mode-warning"
                ><i
                  class="settings-debug-mode-warning fa-solid fa-triangle-exclamation"
                ></i>
                Warning: Not recommended for Normal Users unless told by a
                Developer!</span
              >
            </div>
          </div>
        </CardItem>
        <CardItem
          icon="fa-solid fa-circle-play"
          title="After Launch"
          subtitle="Select which action your launcher should take on launch"
          class="settings-card-little"
        >
          <div id="settings-after-launch">
            <button
              class="button settings-after-launch-action"
              v-for="action in actions"
              v-bind:key="action.id"
              v-bind:class="{
                'settings-after-launch-action-active':
                  actionAfterLaunch === action.id,
              }"
              @click="updateActionAfterLaunch(action.id)"
            >
              {{ action.name }}
            </button>
          </div>
        </CardItem>
      </div>
    </Card>

    <Card
      icon="fa-brands fa-java"
      title="JAVA SETTINGS"
      subtitle="JAVA & JRE PREFERENCES"
      background="settings-2"
      class="settings-card"
      contentClass="horizontal-card-container"
    >
      <CardItem
        icon="fa-brands fa-java"
        title="JVM Arguments"
        subtitle="Put your JVM arguments here (if you don't really know what this is, don't touch it or use a preset)"
        class="settings-card-item"
      >
        <div id="settings-args">
          <textarea
            spellcheck="false"
            id="settings-args-input"
            v-model="jvmArguments"
            @change="updateJvmArguments()"
          ></textarea>
          <button
            class="button"
            id="settings-args-button"
            @click="jvmArgumentsPresetsVisible = !jvmArgumentsPresetsVisible"
          >
            <i class="fa-solid fa-circle-chevron-down button-icon"></i>
            <span class="button-text">Presets</span>
          </button>
          <div id="args-presets" v-if="jvmArgumentsPresetsVisible">
            <div id="args-presets-title-container">
              <i class="fa-brands fa-java" id="args-presets-icon"></i>
              <h3 id="args-presets-title">Arguments presets</h3>
            </div>
            <p id="args-presets-subtitle">
              Select a preset from the list below, these presets are safe if
              used with the correct JRE
            </p>
            <div id="args-presets-preset-container">
              <button
                v-for="jvmArgumentsPreset in jvmArgumentsPresets"
                v-bind:key="jvmArgumentsPreset"
                class="args-presets-preset-button"
                @click="updateJvmArguments(jvmArgumentsPreset.args)"
              >
                {{ jvmArgumentsPreset.name }}
              </button>
            </div>
          </div>
        </div>
      </CardItem>
      <div class="settings-card-item settings-card-item-container">
        <CardItem
          icon="fa-solid fa-desktop"
          title="Java Executable"
          subtitle="Set a custom JRE and whether or not to show the console when running the game"
          class="settings-card-little"
          id="jre-settings"
        >
          <div id="settings-jre-path">
            <input
              type="text"
              v-model="jrePath"
              class="input"
              id="settings-jre-path-input"
              @click="setJrePath()"
            />
            <button
              class="button"
              id="settings-jre-path-button"
              @click="resetJrePath()"
            >
              <i class="fa-solid fa-arrow-rotate-right button-icon"></i>
              <span class="button-text">Reset</span>
            </button>
          </div>
          <div id="settings-debug-mode">
            <input
              type="checkbox"
              id="settings-debug-mode-input"
              v-model="debugMode"
              @change="updateDebugMode()"
            /><span id="settings-debug-mode-text">Launch in debug mode</span>
          </div>
        </CardItem>
      </div>
      <CardItem
        icon="fa-solid fa-file-zipper"
        title="JRE Downloader"
        subtitle="⚠️ If the download button does nothing, then it is unsupported."
        class="settings-card-item"
      >
        <div id="settings-jre-downloader">
          <div
            v-for="jre in availableJres"
            v-bind:key="jre.name"
            class="jre-item"
          >
            {{ jre.name }}
            <button
              class="jre-item-button"
              @click="downloadJre(jre)"
              v-if="!downloadedJres.includes(jre.name)"
              :disabled="
                downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i
                class="fa-solid fa-spinner jre-item-icon jre-item-icon-spinner"
                v-if="downloadingJre === jre.name"
              ></i>
              <i
                class="fa-solid fa-download jre-item-icon"
                v-if="downloadingJre !== jre.name"
              ></i>
              <span v-if="downloadingJre !== jre.name">Download</span>
            </button>
            <button
              class="jre-item-button-blue"
              @click="applyJre(jre.name)"
              v-if="
                downloadedJres.includes(jre.name) &&
                jrePath.includes(`/.lunarclient/solartweaks/jres/${jre.name}/`)
              "
              :disabled="
                !downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i class="fa-solid fa-screwdriver-wrench jre-item-icon"></i
              >Applied
            </button>
            <button
              class="jre-item-button"
              @click="applyJre(jre.name)"
              v-if="
                downloadedJres.includes(jre.name) &&
                !jrePath.includes(`/solartweaks/jres/${jre.name}/`)
              "
              :disabled="
                !downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i class="fa-solid fa-screwdriver-wrench jre-item-icon"></i>Apply
            </button>
            <button
              class="jre-item-button jre-item-button-red"
              @click="removeJre(jre.name)"
              v-if="downloadedJres.includes(jre.name)"
              :disabled="
                !downloadedJres.includes(jre.name) || !jreDownloaderEnabled
              "
            >
              <i class="fa-solid fa-trash-can jre-item-icon"></i>Remove
            </button>
          </div>
        </div>
      </CardItem>
    </Card>
  </div>
</template>

<script>
import Card from '../Card/Card.vue';
import CardItem from '../Card/CardItem.vue';

import { remote } from 'electron';
import settings from 'electron-settings';
import { totalmem, platform } from 'os';
import { join } from 'path';
import { defaultSettings, getDefaultJREPath } from '../../javascript/settings';
import axios from 'axios';
import { cache } from '../../main';
import {
  downloadJre as _downloadJre,
  removeJre as _removeJre,
} from '../../javascript/jreDownloader';
import Logger from '../../javascript/logger';
import constants from '../../constants';
const logger = new Logger('settings');

export default {
  name: 'Settings',

  components: {
    Card,
    CardItem,
  },

  data: () => ({
    directories: [],
    ram: {
      minimum: 1536,
      maximum: totalmem() / 1024 / 1024,
      current: 2048,
    },
    resolution: {
      width: 854,
      height: 480,
    },
    actions: [
      { name: 'Close Launcher', id: 'close' },
      { name: 'Hide Launcher', id: 'hide' },
      { name: 'Keep Launcher Open', id: 'keep' },
    ],
    actionAfterLaunch: 'close',
    jvmArguments: '-XX:+DisableAttachMechanism',
    jvmArgumentsPresetsVisible: false,
    jvmArgumentsPresets: [
      {
        name: 'Default',
        args: '-XX:+DisableAttachMechanism',
      },
      {
        name: 'Zulu optimized',
        args: '-XX:+UnlockExperimentalVMOptions -XX:+AlwaysActAsServerClassMachine -XX:MaxTenuringThreshold=1 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:-UsePerfData -XX:+PerfDisableSharedMem -XX:+AlwaysPreTouch -XX:+EliminateLocks -XX:+EagerJVMCI',
      },
      {
        name: 'GraalVM Community',
        args: '-XX:+DisableAttachMechanism -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -XX:+EnableJVMCI -XX:+UseJVMCICompiler -XX:+EagerJVMCI -Djvmci.Compiler=graal',
      },
      {
        name: 'GraalVM Enterprise',
        args: '-Xss2M -XX:+UnlockExperimentalVMOptions -XX:+AlwaysActAsServerClassMachine -XX:MaxTenuringThreshold=1 -XX:SurvivorRatio=32 -XX:G1HeapRegionSize=8M -XX:GCTimeLimit=50 -XX:G1MixedGCCountTarget=4 -XX:G1MixedGCLiveThresholdPercent=90 -XX:-UsePerfData -XX:+PerfDisableSharedMem -XX:+UseLargePages -XX:+AlwaysPreTouch -XX:JVMCIThreads=2 -XX:+EliminateLocks -XX:+AggressiveHeap -Dgraal.TuneInlinerExploration=1 -XX:+EagerJVMCI',
      },
    ],
    jrePath: '',
    debugMode: false,
    skipChecks: false,
    // Enabled by default because a lot of people are on Windows, Mac, and Linux.
    jreDownloaderEnabled: true,
    availableJres: {
      Temurin: {
        32: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_x86-32_windows_hotspot_17.0.4.1_1.zip',
          checksum:
            '61e1a7aa34c4ad876a8ef6176ef17193e4fdaf1d7d402603f677800ec9e06de9',
        },
        64: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_x64_windows_hotspot_17.0.4.1_1.zip',
          checksum:
            '10b007eb1b424a83729e335917a4851e426d716349439aef71d63bbcba24b702',
        },
        MacArm: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_aarch64_mac_hotspot_17.0.4.1_1.tar.gz',
          checksum:
            '63a32fe611f2666856e84b79305eb80609de229bbce4f13991b961797aa88bf8',
          tar: true,
        },
        MacX64: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_x64_mac_hotspot_17.0.4.1_1.tar.gz',
          checksum:
            '9c59e45a9a6cbc1b8d671c4a88bb8d9b8929fae067df0d0a73b1ca71781a0996',
          tar: true,
        },
        LinuxArm: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_aarch64_linux_hotspot_17.0.4.1_1.tar.gz',
          checksum:
            '2e4137529319cd7935f74e1289025b7b4c794c0fb47a3d138adffbd1bbc0ea58',
          tar: true,
        },
        LinuxX64: {
          url: 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.4.1%2B1/OpenJDK17U-jre_x64_linux_hotspot_17.0.4.1_1.tar.gz',
          checksum:
            'e96814ee145a599397d91e16831d2dddc3c6b8e8517a8527e28e727649aaa2d1',
          tar: true,
        },
        name: 'Temurin',
      },
      Zulu: {
        32: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.19-ca-jre17.0.4.1-win_i686.zip',
          checksum:
            '1b9e186a73a14a17d243c62c66babe09fdcf91cabbb02715facd8dd24d5416c2',
        },
        64: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.17-ca-jre17.0.4.1-win_x64.zip',
          checksum:
            '07d35e9c9c42ee9da54c1b839cb19280b5b95921cc59efceae1a601e72642946',
        },
        MacArm: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.17-ca-jre17.0.4.1-macosx_aarch64.zip',
          checksum:
            'a3fd5a58756ccb3e11af1c9cbc289178070d7166dec0aa1a8d046aa6514ecb20',
        },
        MacX64: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.17-ca-jre17.0.4.1-macosx_x64.zip',
          checksum:
            'a893ad72164ff59c69379a4539297b1db4ad7e0a5e6116f1c1fbdf049dee696e',
        },
        LinuxArm: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.17-ca-jre17.0.4.1-linux_aarch64.tar.gz',
          checksum:
            '22c426e8065185d62d6a7113c49d43ed23cd612353265a8c6d39e61107c9605c',
          tar: true,
        },
        LinuxX64: {
          url: 'https://cdn.azul.com/zulu/bin/zulu17.36.17-ca-jre17.0.4.1-linux_x64.zip',
          checksum:
            '2d3ff2fb0dbcfcfbde8f9f931c42bfb40fcf35d0ade3864f3dbb54c7dfcf20b6',
        },
        name: 'Zulu',
      },
      GraalVM: {
        64: {
          url: 'https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.2.0/graalvm-ce-java17-windows-amd64-22.2.0.zip',
          checksum:
            '0930735fafe50f295b3e46c5e860ca3500aa76bdeb02f1af142bedab88a371c8',
        },
        MacArm: {
          url: 'https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.2.0/graalvm-ce-java17-darwin-aarch64-22.2.0.tar.gz',
          checksum:
            'cfbeb38cd707a330048ab2140cb185176201c5cb654df752fcb4bd95e899b4ec',
          tar: true,
        },
        MacX64: {
          url: 'https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.2.0/graalvm-ce-java17-darwin-amd64-22.2.0.tar.gz',
          checksum:
            'b92b6f5f7f11282f20c8f8b94ea1c16d776cbadd7b254119836a7ace9f513b0d',
          tar: true,
        },
        LinuxArm: {
          url: 'https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.2.0/graalvm-ce-java17-linux-aarch64-22.2.0.tar.gz',
          checksum:
            '3025cc887bdaa088c89601b42931abc61dfd108aaad386abee8c1e08c913504d',
          tar: true,
        },
        LinuxX64: {
          url: 'https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.2.0/graalvm-ce-java17-linux-amd64-22.2.0.tar.gz',
          checksum:
            'cd903566d030bf44a8c5c0f50914fc9c9d89cb2954e1f90512b137a0bfedc3ca',
          tar: true,
        },
        name: 'GraalVM',
      },
    },
    downloadedJres: [],
    downloadingJre: '',
  }),

  methods: {
    /**
     * Set the new directory for a given version
     * @param {string} version The version to set the directory for
     */
    async setNewDirectory(version) {
      const directoryIndex = this.directories.findIndex(
        (directory) => directory.version === version
      );
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new directory for Lunar Client ${version}`,
        defaultPath: this.directories[directoryIndex].path,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      this.directories[directoryIndex].path = folder.filePaths[0];

      await settings.set('launchDirectories', this.directories);
    },

    /**
     * Reset the launch directories to their default values
     */
    async resetLaunchDirectories() {
      this.directories = defaultSettings.launchDirectories;
      await settings.set('launchDirectories', this.directories);
    },

    /**
     * Update the allocated memory for the game
     */
    async updateRam() {
      await settings.set('ram', this.ram.current);
    },

    /**
     * Update the resolution for the game
     */
    async updateResolution() {
      if (!this.resolution.width) this.resolution.width = 854;
      if (!this.resolution.height) this.resolution.height = 480;
      await settings.set('resolution', this.resolution);
    },

    /**
     * Update the action to take after launch
     * @param {'close'|'hide'|'keep'} action The action to take after launch
     */
    async updateActionAfterLaunch(action) {
      this.actionAfterLaunch = action;
      await settings.set('actionAfterLaunch', action);
    },

    /**
     * Update JVM arguments
     */
    async updateJvmArguments(newArguments = undefined) {
      if (newArguments) {
        this.jvmArgumentsPresetsVisible = false;
        this.jvmArguments = newArguments;
      }
      await settings.set('jvmArguments', this.jvmArguments);
    },

    /**
     * Set new JRE path
     */
    async setJrePath() {
      const folder = await remote.dialog.showOpenDialog({
        title: `Select the new JRE for Lunar Client (Select the bin folder)`,
        defaultPath: this.jrePath,
        properties: ['dontAddToRecent', 'openDirectory'],
      });

      if (folder.canceled) return;

      this.jrePath = folder.filePaths[0];

      await settings.set('jrePath', this.jrePath);
    },

    /**
     * Reset JRE path
     */
    async resetJrePath() {
      this.jrePath = await getDefaultJREPath();
      await settings.set('jrePath', this.jrePath);
      this.jvmArguments =
        this.jvmArgumentsPresets.find(
          (i) => i.name === (this.jrePath != '' ? 'Zulu optimized' : 'Default')
        )?.args || '';
      await this.updateJvmArguments();
      logger.info(`Reset JRE Path to \`${this.jrePath}\``);
    },

    /**
     * Update the debug mode
     */
    async updateDebugMode() {
      await settings.set('debugMode', this.debugMode);
    },

    /**
     * Update the skip checks
     */
    async updateSkipChecks() {
      await settings.set('skipChecks', this.skipChecks);
    },

    /**
     * Update downloaded JREs
     */
    async updateDownloadedJres() {
      await settings.set('downloadedJres', this.downloadedJres);
    },

    /**
     * Apply a JRE
     */
    async applyJre(jrePath) {
      this.jrePath = join(
        constants.DOTLUNARCLIENT,
        'solartweaks',
        'jres',
        jrePath,
        'bin'
      );
      if (this.jrePath === (await settings.get('jrePath'))) return;
      this.jvmArguments =
        this.jvmArgumentsPresets.find(
          (i) =>
            i.name ===
            (jrePath === 'Zulu'
              ? 'Zulu optimized'
              : jrePath === 'GraalVM'
              ? 'GraalVM Community'
              : 'Default')
        )?.args || '';
      await settings.set('jrePath', this.jrePath);
      await this.updateJvmArguments();
    },

    /**
     * Call the JRE downloader
     * @param {any} jre JRE Object
     */
    async downloadJre(jre) {
      this.jreDownloaderEnabled = false;
      this.downloadingJre = jre.name;
      const success = await _downloadJre(jre);

      logger.info(
        `${success ? 'Successfully Downloaded' : 'Failed to Download'} JRE ${
          jre.name
        }`
      );

      if (success) {
        this.downloadedJres.push(jre.name);
        await this.updateDownloadedJres();
        await this.applyJre(jre.name);
      }

      this.downloadingJre = '';
      this.jreDownloaderEnabled = true;
    },

    /**
     * Call the JRE Downloader to remove a JRE
     */
    async removeJre(jre) {
      this.downloadedJres = this.downloadedJres.filter((name) => name !== jre);
      await this.updateDownloadedJres();
      await _removeJre(jre);
      if (this.jrePath.includes(`/solartweaks/jres/${jre}/`))
        await this.resetJrePath();
    },
  },

  async beforeMount() {
    this.directories = await settings.get('launchDirectories');
    this.ram.current = await settings.get('ram');
    this.resolution = await settings.get('resolution');
    this.actionAfterLaunch = await settings.get('actionAfterLaunch');
    this.jvmArguments = await settings.get('jvmArguments');
    this.jrePath = await settings.get('jrePath');
    this.debugMode = await settings.get('debugMode');
    this.skipChecks = await settings.get('skipChecks');
    this.downloadedJres = (await settings.get('downloadedJres')) ?? [];

    if (
      platform() !== 'win32' &&
      platform() !== 'darwin' &&
      platform() !== 'linux'
    )
      this.jreDownloaderEnabled = false;

    if (cache.has('availableJres'))
      return (this.availableJres = cache.get('availableJres'));

    await axios
      .get(`${constants.API_URL}/launcher/jreDownloader`)
      .then((response) => {
        cache.set('availableJres', response.data);
        this.availableJres = response.data;
        logger.info(`Fetched available JREs:`, response.data);
      })
      .catch((err) => {
        cache.set('availableJres', this.availableJres);
        logger.warn(
          'Failed to fetch available JREs, falling back to hardcoded data...',
          err
        );
      });
  },
};
</script>

<style scoped>
/* Pseudo components */

#settings-skip-checks-input {
  height: 20px;
  width: 25px;
  -webkit-appearance: none;
  background-color: #343434;
  background-image: url('../../assets/checkmark.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: darken;
  border-radius: 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.2s ease;
}
#settings-skip-checks-input:hover {
  background-color: #303030;
  color: #fff;
}
#settings-skip-checks-input:checked {
  background-color: #269e4e;
  background-image: url('../../assets/checkmark.svg');
  background-size: 70%;
  background-blend-mode: normal;
  color: #fff;
}
.input {
  font-weight: 400;
  height: 10px;
  background-color: #171717;
  border: none;
  outline: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 5px;
}
.button {
  background-color: #269e4e;
  border: none;
  height: 30px;
  border-radius: 5px;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  transition: background-color 0.2s ease-in-out;
}
.button:hover {
  background-color: #196d35;
}
.button-icon {
  margin-left: 20px;
  margin-right: 10px;
}
.button-text {
  font-weight: 400;
  margin-right: 20px;
}
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: #d3d3d350;
  opacity: 1;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}
.slider::-webkit-slider-thumb:active {
  background: rgb(148, 195, 224);
  border: 1px solid white;
  box-shadow: 0 0 0 5px rgba(38, 118, 158, 0.25);
}
/* Content */
#settings-container {
  font-weight: 400;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 75px;
}
.settings-card {
  font-weight: 500;
  margin-top: 10px;
}
.settings-card-item {
  font-weight: 300;
  letter-spacing: 0.2px;
  margin: 10px;
  flex: 1 1 0px;
}
.settings-card-item.settings-card-item-container {
  display: flex;
  flex-direction: column;
}
#settings-directories {
  margin-top: 20px;
  display: flex;
  flex: 1 1 0px;
  flex-direction: column;
  justify-content: space-between;
}
.settings-directories-item {
  display: flex;
  align-items: center;
  margin: 3px;
}
.settings-directories-item-version {
  font-weight: 400;
  font-size: 15px;
  margin-right: 10px;
}
.settings-directories-input {
  flex: 1 1 0px;
}
#directory-reset-button {
  margin-top: 15px;
}
.directories-card-item {
  display: flex;
  flex-direction: column;
}
.directories-card-item-content {
  flex: 1 1 0px;
  display: flex;
}
#settings-ram {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#settings-ram-slider {
  margin-top: 5px;
  margin-bottom: 20px;
}
#settings-ram-values-container {
  text-align: center;
}
#settings-ram-indicator {
  font-size: 10px;
  margin-top: 5px;
  letter-spacing: 1px;
}
.settings-resolution-title {
  display: flex;
  font-weight: 400;
}
.settings-resolution-icon {
  font-size: 20px;
  margin-right: 7px;
}
.settings-resolution-input {
  border: #343434 1px solid;
  background: transparent;
  outline: none;
  width: 75px;
  height: 30px;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.5);
  margin-top: 12px;
  text-align: center;
  font-style: italic;
  font-size: 16px;
  font-weight: 500;
}
.settings-resolution-input:focus {
  border: 1px solid rgba(38, 118, 158, 1);
  box-shadow: 0 0 0 2px rgba(38, 118, 158, 0.25);
}
.settings-resolution-input::-webkit-outer-spin-button,
.settings-resolution-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
#settings-resolution {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  height: 69px;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.5);
}
#settings-resolution-left {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
}
#settings-resolution-right {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}
.settings-before-launch-container {
  display: flex;
  flex-direction: row;
}
.settings-before-launch {
  margin-top: 7px;
  display: flex;
  flex-direction: column;
  font-size: 15px;
  font-weight: 300;
  text-align: left;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
}

#settings-after-launch {
  width: 100%;
}

.settings-after-launch-action {
  width: 100%;
  background-color: #343434;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  margin-top: 10px;
}

.settings-after-launch-action:hover {
  background-color: #2b2b2b;
}

.settings-after-launch-action-active {
  background-color: #269e4e;
}

.settings-after-launch-action-active:hover {
  background-color: #196d35;
}

#settings-args {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

#args-presets {
  position: absolute;
  width: 490px;
  height: 190px;
  margin-left: 380px;
  padding: 8px;
  background-color: var(--color-background);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
}

#args-presets-title-container {
  display: flex;
}

#args-presets-icon {
  font-size: 26px;
  margin-top: 8px;
  margin-left: 15px;
}

#args-presets-title {
  font-size: 20px;
  margin-left: 10px;
  font-weight: 500;
  margin-top: 9px;
}

#args-presets-subtitle {
  font-weight: 300;
  font-size: 12px;
  margin-left: 15px;
  margin-top: 6px;
  padding-bottom: 5px;
}

#args-presets-preset-container {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  grid-template-rows: repeat(5, 25px);
  grid-column-gap: 5px;
  grid-row-gap: 3px;
}

.args-presets-preset-button {
  border-radius: 6px;
  width: 150px;
  height: 25px;
  outline: none;
  border: none;
  background-color: #252523;
  margin-top: 2px;
  margin-left: 15px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.args-presets-preset-button:hover {
  background-color: #2b2b2b;
}

#settings-args-input {
  resize: none;
  font-weight: 400;
  border: none;
  outline: none;
  background-color: #171717;
  font-style: italic;
  margin: 5px;
  margin-bottom: 0px;
  width: 95%;
  height: 75%;
  padding: 10px;
  border-radius: 5px;
}

#settings-args-button {
  margin-top: 10px;
}

#settings-jre-path {
  display: flex;
  margin-top: 5px;
}

#settings-jre-path-input {
  flex: 1 1 0px;
  height: 20px;
  margin-right: 7px;
}

#settings-debug-mode {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

#settings-debug-mode-input {
  margin-top: 7px;
  height: 20px;
  width: 20px;
  -webkit-appearance: none;
  background-color: #343434;
  background-image: url('../../assets/checkmark.svg');
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: darken;
  border-radius: 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s ease;
}

#settings-debug-mode-input:hover {
  background-color: #303030;
  color: #fff;
}
#settings-debug-mode-input:checked {
  background: #269e4e;
  background-color: #269e4e;
  background-image: url('../../assets/checkmark.svg');
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: normal;
  color: #fff;
}

#settings-debug-mode-text {
  margin-top: 7px;
  margin-left: 10px;
}

#settings-before-launch-text {
  margin-left: 10px;
}

.settings-debug-mode-warning {
  background: #171717;
  font-size: 12px;
  font-weight: 600;
  border-radius: 5px;
  margin: 5px 0;
  letter-spacing: 0.2px;
  padding: 5px;
  line-height: 10px;
  text-align: center;
  border-radius: 2px;
  text-transform: uppercase;
  color: #ba2828;
}

.settings-debug-mode-warning i {
  padding: 0 0;
}

#settings-jre-downloader {
  margin-top: 20px;
  height: 234px;
}
#jre-settings {
  margin: 0;
}
.jre-item {
  margin: 10px;
}
.jre-item-button {
  margin-left: 5px;
  border: none;
  background-color: #269e4e;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.jre-item-button-blue {
  margin-left: 5px;
  border: none;
  background-color: #196d35;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  cursor: not-allowed;
}
.jre-item-button-blue:disabled {
  margin-left: 5px;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  background-color: #343434;
}
.jre-item-button.jre-item-button-red {
  background-color: #dd3e3e;
}
.jre-item-button.jre-item-button-red:hover {
  background-color: #c12c2c;
}
.jre-item-button.jre-item-button-red:disabled {
  background-color: #343434;
  cursor: not-allowed;
}
.jre-item-button:hover {
  background-color: #196d35;
}
.jre-item-button:disabled {
  background-color: #343434;
  cursor: not-allowed;
}
.jre-item-icon {
  margin-right: 5px;
}
.jre-item-icon-spinner {
  animation-name: spin;
  animation-duration: 2000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
