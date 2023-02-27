<template>
  <div id="home-container">
    <div id="quick-play-container" v-if="starredServers.length">
      <div class="quick-play-content">
        <div class="quick-play-servers">
          <div
            class="quick-play-server"
            v-for="server of starredServers"
            v-bind:key="server.ip"
            @click="launchGame(server)"
          >
            <img :src="server.icon" />
          </div>
        </div>
      </div>
    </div>
    <div id="posts-container">
      <div
        v-for="post in posts"
        v-bind:key="post.url"
        class="post-container"
        :class="{
          'post-container-normal': starredServers.length,
          'post-container-large': !starredServers.length,
        }"
      >
        <div class="post-image-container">
          <img
            :src="post.imageUrl"
            width="400"
            height="170"
            draggable="false"
            class="post-image"
            alt="Post Image"
          />
        </div>
        <p
          class="post-description"
          :class="{
            'post-description-normal': starredServers.length,
            'post-description-large': !starredServers.length,
          }"
        >
          {{ post.description }}
        </p>
        <div id="post-bottom-container">
          <div class="post-author-container">
            <p class="post-author">
              <img
                :src="post.avatarUrl"
                class="post-author-avatar"
                alt="Author Avatar"
              />
              <bold>{{ post.author }}</bold>
            </p>
          </div>
          <button class="post-button" @click="openLink(post.url)">
            <i :class="post.button?.icon ?? 'fa-solid fa-book'"></i
            ><span class="post-btn-text">{{
              post.button ? post.button.text : 'Read more'
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron';
import axios from 'axios';

import { cache } from '../../main';
import Logger from '../../javascript/logger';
import constants from '../../constants';
import settings from 'electron-settings';
import { checkAndLaunch } from '../../javascript/minecraft';

const logger = new Logger('home');

export default {
  name: 'Home',

  data: () => ({
    posts: [],
    starredServers: [],
  }),

  methods: {
    /**
     * Opens a link in the default browser
     * @param {string} url The url to open
     */
    async openLink(url) {
      await remote.shell.openExternal(url);
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
            if (response.data.status === 'success')
              cache.set(server.ip, response.data);
            content = response.data;
            logger.debug(`Fetched ${server.ip} status`);
          });
      }
      if (content.status === 'success') {
        server.online = true;
        server.icon = content.favicon ?? placeHolderIcon;
      } else {
        server.online = false;
        server.icon = placeHolderIcon;
      }
      return server;
    },

    async launchGame(server) {
      await checkAndLaunch(server.ip);
    },
  },

  async beforeMount() {
    this.starredServers = await Promise.all(
      (
        await settings.get('starredServers')
      ).map((server) => this.fetchServer({ ip: server }))
    );

    if (cache.has('blogPosts')) return (this.posts = cache.get('blogPosts'));

    await axios
      .get(`${constants.API_URL}/launcher/blogPosts`)
      .then((response) => {
        logger.info(`Fetched Solar Tweaks Blog Posts`, response.data);
        this.posts = response.data;
      });
    await axios
      .get('https://api.lunarclientprod.com/launcher/metadata')
      .then(({ data: { blogPosts } }) => {
        logger.info(`Fetched Lunar Client Blog Posts`, blogPosts);
        const lcPosts = blogPosts.map((blog) => {
          let post = {
            description: blog.excerpt,
            imageUrl: blog.image,
            avatarUrl: `https://cravatar.eu/avatar/${blog.author}`,
            author: blog.author,
            lunar: true,
          };
          if (blog.link) {
            post.url = blog.link;
            post.button = { text: 'Read more', icon: 'fa fa-book' };
          }
          return post;
        });
        if (this.posts.length)
          this.posts = this.posts.map((post) => {
            if (post.lunar) return lcPosts.splice(0, 1)[0];
            else return post;
          });
        else this.posts = lcPosts.slice(0, 3);
      });
    cache.set('blogPosts', this.posts);
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  background-color: #42414012;
  border-radius: 90px;
  width: 5px;
  display: flex;
}

::-webkit-scrollbar-thumb {
  border-radius: 90px;
  background-color: #424140;
}

#quick-play-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  background: var(--card-background);
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
}

.quick-play-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  padding: 9px;
  overflow-x: scroll;
  overflow-y: hidden;
}

.quick-play-content::-webkit-scrollbar {
  background-color: transparent;
  border-radius: 90px;
  height: 5px;
  width: 5px;
  display: flex;
}

.quick-play-content::-webkit-scrollbar-thumb {
  border-radius: 90px;
  background-color: #424140;
}

.quick-play-servers {
  display: flex;
  gap: 40px;
}

.quick-play-server {
  width: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 45px;
  border-radius: 0.5rem;
  filter: saturate(0);
  opacity: 0.5;
  transition: 0.5s ease;
}

.quick-play-server:hover {
  opacity: 1;
  filter: saturate(1);
}

.quick-play-server img {
  position: absolute;
  width: 45px;
  backface-visibility: hidden;
  height: auto;
  transition: 0.5s ease;
  margin-top: 5px;
}

.quick-play-server:hover img {
  transform: scale(1.15);
}

#posts-container {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-bottom: 5%;
}
.post-container {
  width: 400px;
  border-radius: 0.5rem;
  margin: 0 5px;
  background: var(--card-background);
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
  transition: transform 0.4s ease;
}
.post-container-normal {
  height: 285px;
}
.post-container-large {
  height: 355px;
}
.post-image-container {
  width: 400px;
  height: 170px;
  overflow: hidden;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.post-image {
  object-fit: cover;
  backface-visibility: hidden;
  transition: transform 0.4s ease;
}
.post-container:hover .post-image {
  transform: perspective(1px) scale(1.1);
}
.post-description {
  display: block;
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: 400;
  text-shadow: var(--short-text-shadow);
  letter-spacing: 0.35px;
  line-height: 20px;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  color: var(--color-text);
  -webkit-box-orient: vertical;
  overflow-y: scroll;
  margin-top: 5px;
}
.post-description-normal {
  height: 45px;
}
.post-description-large {
  height: 115px;
}

#post-bottom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 7px;
}

.post-author-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  margin-top: 5px;
}

.post-author-avatar {
  width: 20px;
  border-radius: 0.15rem;
  height: 20px;
  vertical-align: text-bottom;
}

.post-author {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  color: var(--color-dark-text);
  font-size: 14px;
  letter-spacing: 0.25px;
  font-weight: 600;
}

.post-button {
  padding: 7px 10px;
  border: none;
  background: var(--color-blue);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 1.25px;
  text-shadow: var(--text-shadow);
  transition: 0.5s ease;
  border: none;
  height: 35px;
  border-top-left-radius: 0.75rem;
  border-bottom-right-radius: 0.5rem;
  margin-top: 12px;
  cursor: pointer;
  transition: background 0.35s ease;
}

.post-button:hover {
  background: var(--color-blue-hover);
}
.post-btn-text {
  margin-left: 5px;
}
</style>
