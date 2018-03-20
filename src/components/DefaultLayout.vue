<template>
  <div class="layout layout-default">
    <IFramePlayer :class="{ inactive: !player1Active, player: true }" :source="player1Url" />
    <IFramePlayer :class="{ inactive: player1Active, player: true }" :source="player2Url" />
  </div>
</template>

<script>
import IFramePlayer from './IFramePlayer';
import { filterByHighestPriority, startRotate, stopRotate } from '../services/scheduler/Scheduler';

export default {
  name: 'DefaultLayout',
  props: {
    programs: {
      type: Array,
    },
  },
  data() {
    return {
      player1Url: '',
      player2Url: '',
      player1Active: true,
      timerTracker: undefined,
      displayDelay: 3000,
    };
  },
  calculated: {
    player1Class: {
      get() {
        return {
          hidden: !this.player1Active,
        };
      },
    },
  },
  watch: {
    programs(value) {
      const programs = filterByHighestPriority(value);

      this.$log.debug('DefaultLayout', 'Loaded programs', programs);

      stopRotate(this.timerTracker);

      // If we only have a single program, don't rotate programs
      if (programs.length === 1) {
        this.player1Url = programs[0].url;
        this.player1Active = true;
        return;
      }

      this.timerTracker = startRotate(programs, (program) => {
        this.$log.debug('DefaultLayout', 'Loading content from URL', program.url);

        // If player 1 is actively playing content, load the new content into
        // player 2, then wait to display it
        if (this.player1Active) {
          this.player2Url = program.url;
        } else {
          this.player1Url = program.url;
        }

        setTimeout(() => {
          this.$log.debug('DefaultLayout', 'Displaying content from URL', program.url);
          this.player1Active = !this.player1Active;
        }, this.displayDelay);
      });
    },
  },
  components: {
    IFramePlayer,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout-default {
  width: 100vw;
  height: 100vh;
  background: #000;
}

.player {
  position: absolute;
  opacity: 1;
  transition: opacity 2s;
}

.inactive {
  opacity: 0;
  transition: opacity 2s;
}
</style>
