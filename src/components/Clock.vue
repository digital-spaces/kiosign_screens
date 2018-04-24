<template>
  <span>{{ time.format('dddd, MMMM Do YYYY - h:mm:ss a') }}</span>
</template>

<script>
export default {
  name: 'Clock',
  props: {
    timeFunction: {
      type: Function,
    },
  },
  data() {
    return {
      time: this.timeFunction(),
    };
  },
  methods: {
    updateTime() {
      this.time = this.timeFunction();
    },
  },
  mounted() {
    setInterval(this.updateTime, 1000);
  },
};
</script>
