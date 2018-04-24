<template>
  <div class="layout layout-split">
    <h1 v-if="activePrograms && activePrograms.length === 0">No Programs Are Currently Active</h1>

    <div v-for="(program, index) in activePrograms" :key="index">
      <IFramePlayer :source="program.url" />
    </div>
  </div>
</template>

<script>
import IFramePlayer from './IFramePlayer';
import { filterByHighestPriority } from '../services/scheduler/Scheduler';

export default {
  name: 'SplitLayout',
  props: {
    programs: {
      type: Array,
    },
  },
  computed: {
    activePrograms: {
      get() {
        return filterByHighestPriority(this.programs);
      },
    },
  },
  components: {
    IFramePlayer,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout-split {
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
}

.layout-split > * {
  flex: 1;
  display: flex;
}

.layout-split > * > * {
  flex: 1;
}

h1 {
  position: absolute;
  width: 100vw;
  font-family: arial,helvetica,sans-serif;
  text-align: center;
  color: #444;
}
</style>
