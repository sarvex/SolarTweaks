<template>
  <div id="modal-container" v-if="$store.state.showModal">
    <div id="modal-form">
      <h2 id="modal-form-title">
        <i class="fa-solid fa-triangle-exclamation" /> An error has occured
      </h2>
      <div id="modal-content">
        <code>{{ $store.state.errorMessage }}</code>
      </div>
      <div id="modal-actions">
        <button
          class="button"
          id="button-close"
          @click="$store.state.showModal = !$store.state.showModal"
        >
          Close
        </button>
        <button
          class="button"
          id="button-copy"
          @click="copyToClipboard($store.state.errorMessage)"
        >
          Copy Error
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  methods: {
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
    },
  },
};
</script>

<style scoped lang="scss">
#modal-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 5;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background-color: var(--backdrop-background);
  text-align: center;
  animation: scale_down 0.5s ease;
}

#modal-form {
  position: fixed;
  height: fit-content;
  padding: 25px;
  z-index: 100;
  width: 650px;
  left: calc((50vw - 50%) * -1);
  top: calc((50vh - 50%) * -1);
  transform: translate(calc(50vw - 50%), calc(50vh - 50%));
  border-radius: 6px;
  justify-content: center;
}

#modal-form-title {
  font-family: var(--font-secondary);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 1px;
  padding: 5px 0;
  width: 100%;
  font-weight: 600;
  font-size: 1.35rem;
  color: var(--color-red);
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
  background-color: var(--color-red-outline);
  border-radius: 5rem;
  margin-bottom: 15px;

  i {
    font-size: 1.75rem;
    color: var(--color-red);
  }
}

#modal-content {
  background-color: var(--color-darker-gray);
  border-radius: 6px;
  padding: 15px 20px;
  text-align: left;
  margin-bottom: 15px;
}

code {
  font-family: consolas, monospace;
  color: var(--color-text);
  user-select: text;
  white-space: pre;
  white-space: pre-wrap;
}

.button {
  background-color: #1f1f1f;
  width: 150px;
  height: 40px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  text-shadow: 0 1px 0 rgb(0 0 0 / 50%);
  font-size: 18px;
  cursor: pointer;
}

#modal-actions {
  display: flex;
  justify-content: space-between;
}

#button-close {
  float: left;
  background-color: var(--color-red);
  transition: background-color 0.2s ease-in-out;
}
#button-close:hover {
  background-color: var(--color-red-hover);
}

#button-copy {
  float: right;
  background-color: var(--color-blue);
  transition: background-color 0.2s ease-in-out;
}
#button-copy:hover {
  background-color: var(--color-blue-hover);
}
</style>
