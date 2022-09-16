<template>
  <div class="card-item">
    <div class="card-item-header">
      <div class="card-item-header-title-container">
        <i :class="icon" class="card-item-icon"></i>
        <h1 class="card-item-title">{{ title }}</h1>
      </div>
      <h4 class="card-item-subtitle">{{ subtitle }}</h4>
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
  background-color: #1d1d1b;
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
  font-weight: 400;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
  font-size: 20px;
}

.card-item-subtitle {
  font-weight: 300;
  font-size: 12px;
  color: #b5b5b5;
  letter-spacing: 0.25px;
  margin-top: 5px;
}
</style>
