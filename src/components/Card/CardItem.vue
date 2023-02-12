<template>
  <div class="card-item">
    <div class="card-item-header">
      <div class="card-item-header-title-container">
        <i :class="icon" class="card-item-icon"></i>
        <h1 class="card-item-title" v-html="title"></h1>
      </div>
      <h4 class="card-item-subtitle" v-html="subtitle"></h4>
    </div>
    <div :class="['card-item-content', contentClass]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardItem',

  props: ['icon', 'title', 'subtitle', 'contentClass'],
};
</script>

<style scoped>
.card-item {
  background-color: var(--card-color-item-background);
  border-radius: 10px;
  padding: 15px;
  margin: 5px;
  margin-top: 15px;
  flex: 1 1 0px;
}

.card-item-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-item-header-title-container {
  display: flex;
}

.card-item-icon {
  font-size: 20px;
  margin-right: 10px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.5));
}

.card-item-title {
  color: var(--engine-color-text);
  font-weight: 500;
  letter-spacing: 1px;
  text-shadow: var(--short-text-shadow);
  font-size: 20px;
}
.card-item-subtitle {
  font-weight: 300;
  font-size: 11.5px;
  color: var(--color-text);
  letter-spacing: 0.2px;
  margin-top: 5px;
}
</style>
