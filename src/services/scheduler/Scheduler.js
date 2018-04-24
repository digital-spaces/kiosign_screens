import Vue from 'vue';
import moment from 'moment';
import Program from './Program';
import Eventable from '../../utils/Eventable';
import { loadPrograms } from '../../utils/api';

/**
 * Finds the highest priority used by the `programs` and filters the array to
 * only include the programs with that priority. If the highest priority is 0,
 * all programs are returned.
 *
 * @param {Array} programs A list of programs
 *
 * @return {Array} A list of the programs with the highest priority
 */
export function filterByHighestPriority(programs) {
  let filtered = [];
  let priority = 0;

  programs.forEach((program) => {
    if (program.priority && program.priority > priority) {
      filtered = [program];
      priority = program.priority;
    } else if (priority === 0 || program.priority === priority) {
      filtered.push(program);
    }
  });

  return filtered;
}

/**
 * The maximum valid value for `setTimeout`, equal to MAX_INT32=(2^31-1)
 *
 * @type {number}
 */
const MAXIMUM_TIMEOUT = 0x7FFFFFFF;

/**
 * A class used to schedule programs.
 *
 * # Events
 *
 * programStart
 * : Fired when a program starts
 *
 * programEnd
 * : Fired when a program ends
 *
 * update
 * : Fired when the scheduler has been updated
 */
export default class Scheduler extends Eventable {
  /**
   * The base time used to calculate the schedule time when in debug mode. Use
   * `setDebugTime` to set this time and activate debug mode and
   * `clearDebugTime` to exit debug mode.
   *
   * @type {moment}
   */
  debugTime = undefined;

  /**
   * The time when the `debugTime` was last set.
   *
   * @type {moment}
   */
  debugTimeSetAt = undefined;

  /**
   * The list of potential programs this scheduler can schedule.
   *
   * @type {Array}
   */
  programs = [];

  /**
   * The programs that are actively running using this scheduler.
   *
   * @type {Array}
   */
  activePrograms = [];

  /**
   * Maps programs to the timers being used to keep track of the next update for
   * each program.
   *
   * @type {Map}
   */
  timers = new Map();

  /**
   * The frequency at which the schedules are reloaded, in seconds. Set to 0 to
   * disable refreshing the schedules.
   *
   * @type {integer}
   */
  refreshRate = 0;

  /**
   * Sets the debug time to `time`. This activates debug mode and makes the
   * schedule time continue to move forward from this time (e.g. if you set this
   * to 13:00 and wait five minutes, the schedule time will be 13:05).
   *
   * @param {moment} time The time to set as the base time for the debug time
   */
  setDebugTime(time) {
    this.debugTime = time;
    this.debugTimeSetAt = moment();

    this.scheduleAll();
  }

  /**
   * Clears the debug time and exits debug mode. After calling this method, the
   * schedule time used by this class will be the current time.
   */
  clearDebugTime() {
    this.debugTime = undefined;
    this.debugTimeSetAt = undefined;

    this.scheduleAll();
  }

  /**
   * Returns the current schedule time for this scheduler. This is the time used
   * to calculate what programs are active.
   *
   * @return {moment} The current schedule time
   */
  getScheduleTime() {
    if (this.debugTime) {
      const elapsed = moment() - this.debugTimeSetAt;

      return moment(this.debugTime).add(elapsed, 'ms');
    }

    return moment();
  }

  /**
   * Loads the schedules for this scheduler from the URL
   *
   * @param {string} url The URL to load the schedules from
   */
  async load(url) {
    Vue.$log.debug('Scheduler', 'Loading program data from', url);

    let programs = await loadPrograms(url);

    programs = programs.map(program => new Program(program));

    Vue.$log.debug('Scheduler', 'Loaded programs', programs);

    // Cancel all existing timers before we reload
    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = new Map();

    // (re)schedule all the programs
    this.programs = programs;
    this.scheduleAll();

    if (this.refreshRate > 0) {
      setTimeout(() => this.load(url), this.refreshRate * 1000);
    }
  }

  /**
   * Schedules all programs configured for this scheduler and fires an `update` event when done.
   */
  scheduleAll() {
    this.programs.forEach(program => this.schedule(program));
    this.update();
  }

  /**
   * Schedules the next run of the `program` using the current schedule time.
   *
   * @param {Program} program The program to schedule
   */
  schedule(program) {
    const scheduleTime = this.getScheduleTime();

    scheduleTime.add(1, 's');

    program.configureNextRun(scheduleTime);

    if (program.nextRun.isExpired || !program.isEnabled) {
      return;
    }

    const nextUpdateAt = program.isActive ? program.nextRun.endAt : program.nextRun.startAt;

    let timeUntilNextUpdate = nextUpdateAt - scheduleTime;

    if (!nextUpdateAt) {
      return;
    }

    if (timeUntilNextUpdate > MAXIMUM_TIMEOUT) {
      timeUntilNextUpdate = MAXIMUM_TIMEOUT;
    }

    // TODO: Write unit tests to test this more thoroughly and then add this as
    //       an assertion here. [twl 17.Mar.18]
    if (timeUntilNextUpdate < 0) {
      throw new Error('Time until next update is less than 0--this should never happen');
    }

    // Decide on the next event now--due to timing issues, doing this within
    // the timer can cause the wrong event to be sent
    const event = program.isActive ? 'programEnded' : 'programStarted';

    this.timers[program] = setTimeout(() => {
      // Remove the old timer reference so we don't try to cancel it later
      delete this.timers[program];

      if (timeUntilNextUpdate < MAXIMUM_TIMEOUT) {
        this.fire(event, program);
        this.schedule(program);
        this.update();
      } else {
        // Just reschedule if the time was so far in the future that we exceeded the max timeout
        this.schedule(program);
      }
    }, timeUntilNextUpdate);
  }

  /**
   * Updates the active schedule, if needed, and calls the registered callback
   * for the scheduler.
   */
  update() {
    this.activePrograms = this.programs.filter(program => program.isActive);
    this.fire('update');
  }
}
