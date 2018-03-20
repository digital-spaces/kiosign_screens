<template>
  <div>
    <iframe class="player" :src="source" />
  </div>
</template>

<script>
export default {
  name: 'IFramePlayer',
  props: {
    source: {
      type: String,
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.player {
  width: 100vw;
  height: 100vh;
  border: none;
}
</style>
