import { createStore } from 'vuex';

const store = createStore({
  state: {
    activeTab: 'Home',
    playContainerHeight: 300,
    isLaunching: false,
    launchingState: {
      title: 'LAUNCH',
      message: 'READY TO LAUNCH',
      icon: 'fa-solid fa-gamepad',
    },
    isShowingTutorial: false,
    showModal: false,
    errorMessage: '',
  },

  getters: {
    getActiveTab: (state) => state.activeTab,
    getPlayContainerHeight: (state) => state.playContainerHeight,
    isLaunching: (state) => state.isLaunching,
    getLaunchingState: (state) => state.launchingState,
  },

  mutations: {
    setActiveTab(state, tab) {
      state.activeTab = tab;
    },
    setPlayContainerHeight(state, height) {
      state.playContainerHeight = height;
    },
    setLaunching(state, isLaunching) {
      state.isLaunching = isLaunching;
    },
    setLaunchingState(state, launchingState) {
      state.launchingState = launchingState;
    },
    setTutorialState(state, isShowingTutorial) {
      state.isShowingTutorial = isShowingTutorial;
    },
    setErrorModal(state, showModal) {
      state.showModal = showModal;
    },
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    },
  },
});

export default store;
