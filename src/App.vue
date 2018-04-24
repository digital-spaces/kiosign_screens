<template>
  <div class="app">
    <DebugPane :scheduler="scheduler" />
    <SplitLayout v-if="layout === 'split'" :programs="activePrograms" />
    <DefaultLayout v-else :programs="activePrograms" />
  </div>
</template>

<script>
import DebugPane from './components/DebugPane';
import DefaultLayout from './components/DefaultLayout';
import SplitLayout from './components/SplitLayout';
import Scheduler from './services/scheduler/Scheduler';
import { loadScreenInfo } from './utils/api';

export default {
  name: 'App',
  props: {
    apiBase: {
      type: String,
    },
    screenId: {
      type: String,
    },
  },
  data() {
    return {
      scheduler: new Scheduler(),
      activePrograms: [],
      layout: 'default',
    };
  },
  components: {
    DebugPane,
    DefaultLayout,
    SplitLayout,
  },
  mounted() {
    loadScreenInfo(this.apiBase, this.screenId).then((response) => {
      if (!response || !response.acf) {
        throw new Error(`Could not load info for screen ${this.screenid}`);
      }

      const acf = response.acf;
      const refreshRate = Number.parseInt(acf.screen_refresh, 10);
      const scheduleId = acf.screen_content && acf.screen_content.ID;
      const scheduleUrl = `${this.apiBase}kiosign_schedules/${scheduleId}`;

      if (acf.layout) {
        this.layout = acf.layout;
      }

      if (refreshRate) {
        this.scheduler.refreshRate = refreshRate * 60;
        this.$log.debug('App', `Scheduler refresh rate: ${refreshRate}`);
      }

      this.scheduler.on('update', () => {
        this.activePrograms = this.scheduler.activePrograms;
        this.$log.debug('App', 'updated active programs', this.activePrograms);
      });

      this.scheduler.load(scheduleUrl);
    });
  },
};
</script>

<style>
body {
  margin: 0;
}

.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}
</style>
