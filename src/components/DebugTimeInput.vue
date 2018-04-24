<template>
  <span>
    <input id="date" type="date" v-model="debugDate" />
    <input id="time" type="time" v-model="debugTime" step="1" />
    <input type="button" value="Set" @click="setDebugTime" />
    <input type="button" value="Clear" @click="clearDebugTime" />
  </span>
</template>

<script>
import moment from 'moment';

function formatDate(datetime) {
  return datetime && datetime.format('YYYY-MM-DD');
}

function formatTime(datetime) {
  return datetime && datetime.format('HH:mm:ss');
}

export default {
  name: 'DebugTimeInput',
  props: {
    scheduler: {
    },
  },
  data() {
    return {
      debugDate: formatDate(this.scheduler.debugTime),
      debugTime: formatTime(this.scheduler.debugTime),
    };
  },
  methods: {
    setDebugTime() {
      const date = this.debugDate || formatDate(moment());
      const time = this.debugTime || formatTime(moment());

      this.scheduler.setDebugTime(moment(`${date} ${time}`));
    },
    clearDebugTime() {
      this.scheduler.clearDebugTime();
    },
  },
};
</script>
