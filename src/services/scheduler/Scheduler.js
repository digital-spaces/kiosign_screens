import Vue from 'vue';
import moment from 'moment';
import Program from './Program';
import Eventable from '../../utils/Eventable';

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
    if (program.schedule.priority && program.schedule.priority > priority) {
      filtered = [program];
      priority = program.schedule.priority;
    } else if (priority === 0 || program.schedule.priority === priority) {
      filtered.push(program);
    }
  });

  return filtered;
}

function rotateProgram(programs, index, callback) {
  const currentProgram = programs[index];
  const nextIndex = (index + 1) % programs.length;
  const timerTracker = {};

  timerTracker.id = setTimeout(() => {
    timerTracker.id = rotateProgram(programs, nextIndex, callback);
  }, currentProgram.schedule.options.length * 1000);

  callback(currentProgram);

  return timerTracker;
}

/**
 * Rotates through each of the programs, letting each program play for the
 * number of seconds defined by `schedule.options.length` then calling the
 * callback when the program changes.
 *
 * @param {Array}    programs [description]
 * @param {Function} callback [description]
 *
 * @return {object} A tracker object used to stop the rotation later
 */
export function startRotate(programs, callback) {
  if (!programs || !programs.length) {
    return undefined;
  }

  return rotateProgram(programs, 0, callback);
}

export function stopRotate(timerTracker) {
  if (timerTracker) {
    clearTimeout(timerTracker.id);
  }
}

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

    // need to reschedule all programs
  }

  /**
   * Clears the debug time and exits debug mode. After calling this method, the
   * schedule time used by this class will be the current time.
   */
  clearDebugTime() {
    this.debugTime = undefined;
    this.debugTimeSetAt = undefined;
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

      return moment().add(elapsed, 'ms');
    }

    return moment();
  }

  /**
   * [schedule description]
   * @param  {[type]} program [description]
   * @return {[type]}         [description]
   */
  schedule(program) {
    const scheduleTime = this.getScheduleTime();

    scheduleTime.add(1, 's');

    program.configureNextRun(scheduleTime);

    if (program.nextRun.isExpired || !program.isEnabled) {
      return;
    }

    const nextUpdateAt = program.isActive ? program.nextRun.endAt : program.nextRun.startAt;
    const timeUntilNextUpdate = nextUpdateAt - scheduleTime;

    if (!nextUpdateAt) {
      return;
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

      this.fire(event, program);
      this.schedule(program);
      this.update();
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
