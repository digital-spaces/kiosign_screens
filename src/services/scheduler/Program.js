import moment from 'moment';
import {
  getFutureDay,
  getPastDay,
  setTime,
  isMidnight,
  parseTime,
  parseDateTime,
  parseDays,
} from '../../utils/date';

/**
 * Returns true if a schedule is always active; false otherwise. A schedule is
 * always active if it is scheduled 7 days a week from 00:00 to 24:00.
 *
 * Note that schedules that are always active can still be restricted to only
 * being active between a start datetime and end datetime.
 *
 * @param {object} schedule The schedule to check
 *
 * @return {Boolean} true if the schedule is always active; false otherwise
 */
function isAlwaysActive(schedule) {
  return schedule.days && schedule.days.length === 7 &&
         isMidnight(schedule.startTime) && isMidnight(schedule.endTime);
}

/**
 * Returns the next date-time after the schedule time that occurs on one of the
 * days in `days` at the time `time`. If `direction`, is `future`, this time
 * will be after the schedule time; otherwise it will be before the schedule time.
 *
 * @param {Array<integer>} days        An ascending sorted array of integer days
 * @param {moment}         time        The time of day for the next time
 * @param {moment}         scheduleTime The schedule time to calculate from
 * @param {string}         direction   One of: future, past
 *
 * @return {moment} The date-time of the next time
 */
function getNextDateTime(days, time, scheduleTime, direction) {
  if (!days || !days.length) {
    return undefined;
  }

  const scheduleDay = scheduleTime.day();

  let baseDay = scheduleDay;
  let nextDay;
  let daysUntil;

  // If the time has already passed for this day and we're looking into the
  // future, then start with the next day
  if (direction === 'future') {
    // TODO: I think there's a bug here if the time is *exactly* the same as the
    //       schedule time and we're using this function to calculate the end
    //       time. It defaults to the old time, not the next time [twl 17.Mr.18]
    if (setTime(moment(scheduleTime), time).isBefore(scheduleTime)) {
      baseDay = scheduleDay < 6 ? scheduleDay + 1 : 0;
    }

    nextDay = getFutureDay(days, baseDay);
    daysUntil = nextDay - scheduleDay;
  } else {
    if (setTime(moment(scheduleTime), time).isAfter(scheduleTime)) {
      baseDay = scheduleDay > 0 ? scheduleDay - 1 : 6;
    }

    nextDay = getPastDay(days, baseDay);
    daysUntil = scheduleDay - nextDay;
  }

  if (daysUntil < 0) {
    daysUntil += 7;
  }

  const nextDateTime = moment(scheduleTime);

  nextDateTime.add(daysUntil, 'days');

  setTime(nextDateTime, time);

  return nextDateTime;
}

/**
 * Deserializes and parses values in a program that uses the new API format.
 *
 * @param {object} program The program to parse
 *
 * @return {object} The program with values deserialized
 */
function parseProgram(program) {
  const schedule = (program && program.schedule) || {};
  const allDays = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];

  return Object.assign({}, program, {
    schedule: {
      days: parseDays(schedule.days || allDays),
      startTime: parseTime(schedule.startTime || '00:00'),
      endTime: parseTime(schedule.endTime || '24:00'),
      startDateTime: parseDateTime(schedule.startDateTime),
      endDateTime: parseDateTime(schedule.endDateTime),
    },
  });
}


/**
 * Represents a program that is set to run on a schedule.
 */
export default class Program {
  /**
   * Whether this program is enabled.
   *
   * @type {Boolean}
   */
  isEnabled = true;

  /**
   * Whether this program is active.
   *
   * @type {Boolean}
   */
  isActive = false;

  /**
   * Constructs a new program using the given configuration information.
   *
   * @param {object} config Initial settings for the program
   */
  constructor(config) {
    Object.assign(this, parseProgram(config));

    if (this.options && this.options.enabled) {
      this.isEnabled = this.options.enabled;
    }
  }

  /**
   * Configures the next run of this program and sets the `nextRun` property to
   * an object containing the `startAt`, `endAt`, `isActive` and `isExpired`
   * values for the next run on or after the `scheduleTime`.
   *
   * @param {[type]} scheduleTime [description]
   */
  configureNextRun(scheduleTime) {
    const schedule = this.schedule;
    const nextRun = {
      startAt: undefined,
      endAt: undefined,
      isExpired: false,
    };

    // Schedules scheduled 24/7 are always active
    if (isAlwaysActive(schedule)) {
      // If an always active schedule has a start datetime, don't start until then
      if (schedule.startDateTime) {
        nextRun.startAt = schedule.startDateTime;
      }

      if (schedule.endDateTime) {
        nextRun.endAt = schedule.endDateTime;
        nextRun.isExpired = nextRun.endAt.isBefore(scheduleTime);
      }
    } else {
      let baseTime = scheduleTime;
      let fixedStart = false; // Indicates whether the start time was calculated or not

      if (schedule.startTime) {
        // If the program isn't scheduled to run into a specific datetime, then
        // calculate our start time from that point on
        if (schedule.startDateTime && schedule.startDateTime.isAfter(scheduleTime)) {
          baseTime = schedule.startDateTime;
        }

        nextRun.startAt = getNextDateTime(schedule.days, schedule.startTime, baseTime, 'future');
      } else {
        nextRun.startAt = schedule.startDateTime;
        fixedStart = true;
      }

      if (schedule.endTime) {
        nextRun.endAt = getNextDateTime(schedule.days, schedule.endTime, baseTime, 'future');

        // If we have a specific datetime that the program ends, it overrides
        // the normal end time of the program
        if (schedule.endDateTime && schedule.endDateTime.isBefore(nextRun.endAt)) {
          nextRun.endAt = schedule.endDateTime;
        }
      } else {
        nextRun.endAt = schedule.endDateTime;
      }

      // If the next scheduled start date is after the next scheduled end date,
      // that means this is an active schedule and we have to look in the past for
      // the start date
      if (!fixedStart && nextRun.startAt.isAfter(nextRun.endAt)) {
        nextRun.startAt = getNextDateTime(schedule.days, schedule.startTime, baseTime, 'past');
      }

      // TODO: Might need to handle midnight condition where start & end times are both midnight
      //       Also test when both times are the same, but not midnight (e.g. 3:00)
      //

      // Disable the schedule after the schedule time
      nextRun.isExpired = schedule.endDateTime != null &&
                          nextRun.startAt.isAfter(schedule.endDateTime);
    }

    this.nextRun = nextRun;

    // The program is active when it is enabled and the schedule time is in
    // between its start and end times (or it has no start or end time)
    this.isActive = this.isEnabled &&
       (!nextRun.startAt || nextRun.startAt.isSameOrBefore(scheduleTime)) &&
       (!nextRun.endAt || nextRun.endAt.isAfter(scheduleTime));
  }

  /**
   * Returns true if `program` is equivalent to this program.
   */
  isEquivalent(program) {
    /**
     * TODO: Add support for comparing schedule `days`, `startTime` and
     *       `endTime`, which may require special comparators. Also consider
     *       renaming this `hasEquivalentSchedule` or splitting into
     *       `isSameSchedule` and `isSamePlayer`--the latter for `url` and
     *       `type`. Options may not be relevant for comparison. [twl 20.Mar.18]
     */
    return program &&
      program.url === this.url &&
      program.type === this.type;

    // TODO: Active these once I have more time to test them. [twl 20.Mar.18]
    //
    // program.priority === this.priority &&
    // program.schedule.startDateTime === this.schedule.startDateTime &&
    // program.schedule.endDateTime === this.schedule.endDateTime;
  }
}
