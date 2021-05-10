<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
export default {
  computed: {
    locale() {
      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale;
    },
  },
};
</script>

<style lang="less">
@import '@/styles/index';

#app {
  width: 100vw;
  height: 100vh;
  line-height: 1.15;
  overflow: hidden;
}
</style>
