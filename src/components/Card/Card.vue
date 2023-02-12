<template>
  <div class="card">
    <div
      class="card-header"
      :style="`background: linear-gradient(0deg, rgb(0 0 0 / 50%), rgb(0 0 0 / 0%)), url('${require(`@/assets/cards-backgrounds/${background}.png`)}')`"
    >
      <div class="card-header-container">
        <div class="card-title-container">
          <i :class="icon" class="card-icon"></i>
          <h1 class="card-title">{{ title }}</h1>
        </div>
        <h4 class="card-subtitle">{{ subtitle }}</h4>
      </div>
    </div>
    <div :class="['card-content', contentClass]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: ['icon', 'title', 'subtitle', 'background', 'contentClass'],
};
</script>

<style scoped>
.card {
  width: 90%;
  height: auto;
  box-shadow: rgb(0 0 0 / 13%) 0px 1px 5px 0px;
}

.card-header {
  width: 100%;
  height: 100px;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  background-repeat: no-repeat;
  background-size: cover;
}

.card-header-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  padding-top: 25px;
}

.card-title-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-icon {
  font-size: 25px;
  margin-right: 10px;
  text-shadow: var(--text-shadow);
}
.card-title {
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: var(--text-shadow);
  font-size: 1.5rem;
}

.card-subtitle {
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 2px;
  color: #d4d4d4;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}

.card-content {
  height: auto;
  background-color: var(--card-background);
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  overflow: hidden;
  display: flex;
}
</style>
