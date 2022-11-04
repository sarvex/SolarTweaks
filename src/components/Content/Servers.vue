<template>
  <div id="servers-container">
    <div
      v-for="server in servers"
      v-bind:key="servers.indexOf(server)"
      class="server-container"
      :style="`background: ${getBackground(server.background)}`"
    >
      <div class="server-icon-container">
        <img
          :src="server.icon"
          class="server-icon"
          alt="Unable to load server icon"
        />
      </div>
      <div class="server-details-container">
        <span class="server-detail-name">{{ server.name }}</span>
        <span class="server-detail"
          >Players Online: <strong>{{ server.playerCount }}</strong>
        </span>
        <span class="server-detail"
          >IP: <strong>{{ server.ip }}</strong>
        </span>
        <span class="server-detail"
          >Status: <strong>{{ server.status }}</strong>
        </span>
      </div>
      <div class="server-play-container">
        <button
          class="server-play-btn"
          :disabled="$store.state.isLaunching"
          @click="launchGame(server.ip)"
        >
          <i class="fa-solid fa-play fa-4x server-play-btn-icon"></i>
          <br /><span class="server-play-btn-text">PLAY</span>
        </button>
      </div>
      <div class="server-delete-container">
        <button
          class="server-delete-btn"
          @click="removeServer(servers.indexOf(server))"
        >
          <i class="fa-solid fa-trash-alt server-delete-btn-icon"></i>
        </button>
      </div>
    </div>
    <div id="add-server-container">
      <button
        id="add-server-btn"
        v-if="!isAddingServer"
        @click="isAddingServer = !isAddingServer"
      >
        <i class="fa-solid fa-plus fa-2x"></i>
      </button>
      <div v-if="isAddingServer">
        <input
          spellcheck="false"
          type="text"
          class="add-server-input"
          v-model="newServer.name"
          placeholder="Enter server name..."
        /><br />
        <input
          spellcheck="false"
          type="text"
          class="add-server-input"
          v-model="newServer.ip"
          placeholder="Enter server ip..."
        /><br />
        <button @click="addServer()" id="add-server-submit">Add Server</button>
      </div>
    </div>
  </div>
</template>

<script>
import settings from 'electron-settings';
import axios from 'axios';

import { cache } from '../../main';
import constants from '../../constants';
import { checkAndLaunch } from '../../javascript/minecraft';
import Logger from '../../javascript/logger';

const logger = new Logger('servers');

export default {
  name: 'Servers',

  data: () => ({
    servers: [],
    isAddingServer: false,
    newServer: {
      name: '',
      ip: '',
    },
  }),

  methods: {
    /**
     * Launch the game
     */
    async launchGame(serverIp) {
      await checkAndLaunch(serverIp);
    },

    /**
     * Add a server to the list (using the `newServer` object)
     */
    async addServer() {
      if (this.newServer.name && this.newServer.ip) {
        const newServer = {
          name: this.newServer.name,
          playerCount: 'Unknown',
          ip: this.newServer.ip,
          icon: '',
          status: 'Unknown',
          background: Math.floor(Math.random() * 9 + 1),
        };
        this.servers.push(newServer);
        this.fetchServer(
          this.servers.find((server) => server.name === newServer.name)
        );
        this.newServer = { name: '', ip: '' };
        this.isAddingServer = false;
        await this.saveServers();
        this.fetchServers();
      } else this.newServer = { name: '', ip: '' };
    },

    /**
     * Remove a server from the list
     * @param {number} index The index of the server to remove
     */
    async removeServer(index) {
      this.servers.splice(index, 1);
      await this.saveServers();
      this.fetchServers();
    },

    /**
     * Save the servers to the settings file
     */
    async saveServers() {
      const servers = [...this.servers];
      servers.forEach((server) => {
        delete server.icon;
        delete server.status;
        delete server.playerCount;
      });
      await settings.set('servers', servers);
      logger.info('Saved servers to settings');
    },

    /**
     * Load servers from settings
     */
    async loadServers() {
      const servers = await settings.get('servers');
      logger.info('Loading servers from settings');
      if (servers) {
        this.servers = servers;
      } else {
        await this.saveServers();
      }
    },

    /**
     * Fetches data for every servers
     */
    async fetchServers() {
      logger.debug('Fetching servers...');
      await Promise.all(this.servers.map((server) => this.fetchServer(server)));
    },

    /**
     * Fetches the server's icon and status
     * @param {Object} server The server to fetch
     */
    async fetchServer(server) {
      const placeHolderIcon =
        'data:image/png;base64,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';
      let content;
      if (cache.has(server.ip)) {
        content = cache.get(server.ip);
        logger.debug(`Cache hit for ${server.ip}`);
      } else {
        const query = {
          ip: server.ip.split(':')[0],
          port: server.ip.split(':')[1],
        };
        logger.debug(`Fetching ${server.ip} status...`);
        await axios
          .get(constants.links.SERVER_STATUS_ENDPOINT, { params: query })
          .then((response) => {
            cache.set(server.ip, response.data);
            content = response.data;
            logger.debug(`Fetched ${server.ip} status`);
          });
      }
      if (content.status === 'success') {
        server.playerCount = content.players.now;
        server.icon = content.favicon ?? placeHolderIcon;
        server.status = 'Online';
      } else {
        server.playerCount = 'Unknown';
        server.status = 'Offline';
        server.icon = placeHolderIcon;
      }
    },

    /**
     * Returns the background corresponding to the id provided (if number) or the url (if string)
     * @param {number|string} background Background id (1 - 7) or url
     */
    getBackground(background) {
      if (typeof background === 'number') {
        if (background >= 0 && background <= 7) {
          return `url('${require(`@/assets/servers-backgrounds/${background}.webp`)}')`;
        } else
          return `url('${require(`@/assets/servers-backgrounds/1.webp`)}')`;
      } else return `url('${background}')`;
    },
  },

  async mounted() {
    // Loading servers data (Online players, status, etc...)
    await this.loadServers();
    await this.fetchServers();
  },
};
</script>

<style scoped>
#servers-container {
  display: grid;
  grid-template-columns: repeat(3, 370px);
  grid-template-rows: repeat(3, 150px);
  grid-column-gap: 30px;
  grid-row-gap: 15px;
  margin-top: 15px;
  justify-content: center;
}

#add-server-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background: #1d1d1b;
  border: 0.5px dashed #2f2f2d;
}

#add-server-btn {
  width: 50px;
  height: 50px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.45s ease;
}

#add-server-btn:hover {
  transform: perspective(1px) scale(1.25);
}

.add-server-input {
  width: 200px;
  height: 20px;
  background-color: #171717;
  border: none;
  outline: none;
  padding: 6px;
  margin-top: 7px;
}

#add-server-submit {
  width: 212px;
  height: 30px;
  background-color: #171717;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 15px;
  margin-top: 7px;
  transform: perspective(1px) scale(1);
  transition: transform 0.2s ease-in-out;
}

#add-server-submit:hover {
  transform: perspective(1px) scale(1.1);
}

.server-container {
  display: flex;
  flex-direction: row;
  width: 370px;
  height: 150px;
  border-radius: 10px;
  transform: perspective(1px) scale(1);
  -webkit-transform: perspective(1px) scale(1);
  font-smooth: subpixel-antialiased;
  -webkit-font-smoothing: subpixel-antialiased;
  transition: transform 0.4s ease;
}

.server-container:hover {
  transform: perspective(1px) scale(1.05);
  -webkit-transform: perspective(1px) scale(1.05);
}

.server-icon {
  -webkit-user-drag: none;
  width: 85px;
  height: 85px;
  object-fit: contain;
  margin: 30px 0 0 10px;
}

.server-details-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
  width: 160px;
}

.server-detail-name {
  font-weight: 500;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  font-size: 18px;
  letter-spacing: 1.5px;
  margin-bottom: 5px;
}

.server-detail {
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 300;
  color: #e6e6e6;
  letter-spacing: 1px;
}

.server-play-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
  float: right;
}

.server-play-btn {
  height: 100px;
  width: 80px;
  border: none;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 0;
  cursor: pointer;
  border-radius: 15px;
}

.server-play-btn:disabled {
  cursor: default;
}

.server-play-btn-icon {
  margin-left: -15px;
  transition: color 0.2s ease-in-out;
}

.server-play-btn:disabled > .server-play-btn-icon {
  color: #858585;
}

.server-play-btn-text {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1.5px;
  margin-top: 10px;
  transition: color 0.2s ease-in-out;
}

.server-play-btn:disabled > .server-play-btn-text {
  color: #858585;
}

.server-delete-container {
  margin-top: 3px;
}

.server-delete-btn {
  border: none;
  background: transparent;
  cursor: pointer;
}

.server-delete-btn-icon {
  color: #b53938;
}
</style>
