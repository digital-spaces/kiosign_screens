<template>
  <div class="layout layout-default">
    <IFramePlayer :class="{ inactive: !player1Active, player: true }" :source="player1Url" />
    <IFramePlayer :class="{ inactive: player1Active, player: true }" :source="player2Url" />
  </div>
</template>

<script>
import IFramePlayer from './IFramePlayer';
import Rotater from '../services/scheduler/Rotater';
import { filterByHighestPriority } from '../services/scheduler/Scheduler';

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
      displayDelay: 3000,
      rotater: null,
      timer: null,
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

      if (!this.rotater) {
        this.rotater = new Rotater();

        this.rotater.on('activate', (program) => {
          this.$log.debug('DefaultLayout', 'Loading content from URL', program.url);

          // Cancel any display that is in progress in favor of this one
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }

          // If player 1 is actively playing content, load the new content into
          // player 2, then wait to display it
          if (this.player1Active) {
            this.player2Url = program.url;
          } else {
            this.player1Url = program.url;
          }

          // Delay showing the actual content to allow it to load first
          //
          // TODO: Attach a listener to the frame to use the 'load' event or
          //       similar to handle this. [twl 20.Mar.18]
          this.timer = setTimeout(() => {
            this.$log.debug('DefaultLayout', 'Displaying content from URL', program.url);
            this.player1Active = !this.player1Active;
            this.timer = null;
          }, this.displayDelay);
        });
      }
      this.rotater.updatePrograms(programs);
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
