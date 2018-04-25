<template>
  <div
    :class="{ collapsed: collapsed, 'debugPane': true }"
    @mouseover="expand"
    @mouseout="collapse"
  >
    <div v-if="!collapsed" class="contents">
      <div>
        <b>Schedule Time:</b>
        <Clock :timeFunction="getScheduleTime" />
      </div>

      <div>
        <b>Debug Time:</b>
        <DebugTimeInput :scheduler="scheduler" />
      </div>

      <div>
        <button @click="togglePinned">{{ pinned ? 'Unpin' : 'Pin' }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Clock from './Clock';
import DebugTimeInput from './DebugTimeInput';

export default {
  name: 'DebugPane',
  props: {
    scheduler: {
    },
  },
  data() {
    return {
      collapsed: true,
      pinned: false,
    };
  },
  components: {
    Clock,
    DebugTimeInput,
  },
  methods: {
    expand() {
      this.collapsed = false;
    },
    collapse() {
      if (!this.pinned) {
        this.collapsed = true;
      }
    },
    togglePinned() {
      this.pinned = !this.pinned;
    },
    getScheduleTime() {
      return this.scheduler.getScheduleTime();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.contents {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 5px 10px;
}

.contents > div {
  display: flex;
  flex-direction: row;
  align-items: center;

  text-align: center;
  font: normal 10pt arial,helvetica,sans-serif;
}

.contents > div > *:first-child {
  margin-right: 5px;
}

.collapsed {
  height: 1px;
  background: #333;
  padding: 0;
}
</style>
