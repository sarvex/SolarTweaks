<template>
  <div id="shortcut-container" v-if="$store.state.isCreatingShortcut">
    <div id="shortcut-form">
      <h2 id="shortcut-form-title">Create shortcut</h2>
      <div id="shortcut-content">
        <div id="shortcut-content-name">
          <span>Shortcut name: </span>
          <input type="text" v-model="name" class="input" />
        </div>
        <div id="shortcut-content-version">
          <span>Version: </span>
          <select v-model="version">
            <option selected value="1.7.10">1.7.10</option>
            <option selected value="1.8.9">1.8.9</option>
            <option selected value="1.12.2">1.12.2</option>
            <option selected value="1.16.5">1.16.5</option>
            <option selected value="1.17.1">1.17.1</option>
            <option selected value="1.18.2">1.18.2</option>
            <option selected value="1.19.2">1.19.2</option>
          </select>
        </div>
        <div id="shortcut-content-server">
          <span>Server (optional): </span>
          <input
            placeholder="hypixel.net"
            v-model="server"
            type="text"
            class="input"
          />
        </div>
      </div>
      <div id="shortcut-actions">
        <button
          class="button"
          id="button-cancel"
          @click="
            $store.state.isCreatingShortcut = !$store.state.isCreatingShortcut
          "
        >
          Cancel
        </button>
        <button class="button" id="button-save" @click="_createShortcut()">
          Create shortcut
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { createShortcut } from '../javascript/shortcut';

export default {
  name: 'CreateShortcut',

  data: () => ({
    name: 'Solar Tweaks (shortcut)',
    version: '1.8.9',
    server: null,
  }),

  methods: {
    _createShortcut() {
      createShortcut(this.name, this.version, this.server);
    },
  },
};
</script>

<style scoped>
.input {
  width: 250px;
  height: 30px;
  background-color: #0f0f0f;
  border: none;
  color: #505050;
  font-weight: 600;
  outline: none;
  text-align: center;
  font-size: 15px;
  padding: 8px;
  margin: 10px;
  border-radius: 4px;
}

select {
  width: 265px;
  height: 50px;
  background-color: #0f0f0f;
  border: none;
  outline: none;
  text-align: center;
  font-size: 12px;
  padding: 8px;
  margin: 10px;
  border-radius: 4px;
  appearance: none;
}

span {
  color: #c8c8c8;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  font-size: 0.85rem;
}

#shortcut-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-top: 110px;
  z-index: 1;
  overflow: hidden;
  background-color: #000000cc;
  text-align: center;
}

#shortcut-form {
  position: fixed;
  background: linear-gradient(to top, #0e0e0ebd, #151515),
    url('.././assets/cards-backgrounds/settings-1.png');
  background-size: cover;
  background-position: center;
  border: 2px #1f1f1f solid;
  height: fit-content;
  padding: 25px;
  z-index: 100;
  width: 60%;
  left: calc((50vw - 50%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border-radius: 15px;
  justify-content: center;
}

#shortcut-form-title {
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 600;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
  margin-bottom: 15px;
}

#shortcut-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#shortcut-content-name {
  margin-left: 8px;
}

#shortcut-content-version {
  margin-left: 50px;
}

.button {
  background-color: #1f1f1f;
  width: 150px;
  height: 40px;
  border: none;
  border-radius: 3px;
  text-shadow: 0 1px 0 #000000cc;
  font-size: 18px;
  cursor: pointer;
}

#shortcut-actions {
  margin-top: 25px;
}

#button-cancel {
  margin-right: 200px;
  background-color: #a22143;
}

#button-save {
  margin-left: 200px;
  background-color: #269d5f;
}

#button-cancel:hover {
  background-color: #7e1934;
}

#button-save:hover {
  background-color: #1e7d4c;
}
</style>
