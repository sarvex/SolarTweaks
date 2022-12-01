<template>
  <div id="home-container">
    <h4 id="posts-title">Recent News</h4>
    <div id="posts-container">
      <div v-for="post in posts" v-bind:key="post.url" class="post-container">
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
        <p class="post-description">{{ post.description }}</p>
        <div id="post-bottom-container">
          <div class="post-author-container">
            <p class="post-author">
              <normal
                style="opacity: 0.7; font-weight: 200; letter-spacing: 0.2px"
                >Posted by
              </normal>
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

const logger = new Logger('home');

export default {
  name: 'Home',

  data: () => ({
    posts: [],
  }),

  methods: {
    /**
     * Opens a link in the default browser
     * @param {string} url The url to open
     */
    openLink(url) {
      remote.shell.openExternal(url);
    },
  },

  async beforeMount() {
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
#posts-title {
  font-size: 1.25em;
  letter-spacing: 3px;
  line-height: 1.2;
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
}
#posts-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-bottom: 5%;
}
.post-container {
  background-color: #201f1d;
  width: 400px;
  height: 250px;
  border-radius: 5px;
  margin-left: 6px;
  margin-right: 6px;
  transition: transform 0.4s ease;
}
.post-image-container {
  width: 400px;
  height: 170px;
  overflow: hidden;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin-left: 5px;
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  color: #dadada;
  -webkit-box-orient: vertical;
  margin-top: 5px;
  font-smooth: antialiased;
  -webkit-font-smoothing: antialiased;
}
#post-bottom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0px;
}
.post-author-container {
  margin-left: 5px;
  margin-right: 5px;
  margin-top: 5px;
}
.post-author-avatar {
  width: 16px;
  height: 16px;
  margin: 0 3px;
  vertical-align: text-bottom;
}
.post-author {
  font-size: 13px;
  font-weight: 500;
}
.post-button {
  background-color: #2b71ce;
  border: none;
  padding: 0px 6px;
  font-weight: 400;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  height: 25px;
  border-radius: 3px;
  margin-top: 6px;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.35s ease;
}
.post-button:hover {
  background-color: #0b51ae;
}
.post-btn-text {
  margin-left: 5px;
}
</style>
