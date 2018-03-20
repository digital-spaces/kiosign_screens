import Vue from 'vue';
import moment from 'moment';

/**
 * Parses a string into an integer. If the string is null, undefined or empty,
 * returns undefined.
 *
 * @param {string} number The string to parse
 *
 * @return {integer} An integer
 */
function parseInt(number) {
  return number != null && number !== '' ? Number.parseInt(number, 10) : undefined;
}

/**
 * Fixes formatting issues with the GUID from the API.
 *
 * @param {string} guid The value of the `guid` field
 *
 * @return {string} The corrected value
 */
function fixGuidHack(guid) {
  return guid && guid.replace('&#038;', '&');
}

/**
 * Transforms a schedule output in ACF format from the API into the new format
 * that will be used when a custom API is created.
 *
 * @param {object} schedule The schedule in ACF format
 *
 * @return {object} The schedule in the new format
 */
function transformAcfSchedule(schedule) {
  return {
    // The type of content to display--for now only supporting iframes
    type: 'iframe',

    // The URL to the content
    url: schedule.content && fixGuidHack(schedule.content.guid),

    priority: schedule.play_exact ? 10 : 0,

    // The days and times to schedule the content if repeating
    days: schedule.play_days,
    startTime: schedule.play_start,
    endTime: schedule.play_end,

    // Specific start and end times to play the content
    startDateTime: schedule.publish_datetime,
    endDateTime: schedule.unpublish_datetime,

    // Options for playing the content
    options: {
      enabled: schedule.play_disable !== true,
      length: parseInt(schedule.play_length),
      transitions: null,
    },

    originalSchedule: schedule,
  };
}

/**
 * Deserializes and parses values in a schedule that uses the new API format.
 *
 * @param {object} schedule The schedule to parse
 *
 * @return {object} The schedule with values deserialized
 */
function parseSchedule(schedule) {
  return Object.assign({}, schedule, {
    days: parseDays(schedule.days),
    startTime: parseTime(schedule.startTime),
    endTime: parseTime(schedule.endTime),
    startDateTime: parseDateTime(schedule.startDateTime),
    endDateTime: parseDateTime(schedule.endDateTime),
  });
}

/**
 * Transforms the data returned from the API into schedule objects that can be
 * passed to the Scheduler.
 *
 * @param {object} data The data returned from the API
 *
 * @return {Array<object>} An array of schedule objects
 */
function transformScheduleData(data) {
  let schedules = [];

  if (data && data.acf) {
    if (data.acf.schedule_repeater) {
      data.acf.schedule_repeater.forEach((schedule) => {
        schedules.push(transformAcfSchedule(schedule));
      });
    } else {
      throw new Error('Cannot find schedule data in response from server');
    }
  } else if (data.schedules) {
    schedules = data.schedules;
  } else {
    throw new Error('No schedule data exists in response from server');
  }

  schedules = schedules.map(parseSchedule);

  return schedules;
}

/**
 * Loads data about a specific screen from the ACF API.
 *
 * @param {string}        apiBase  The URL to the API
 * @param {string|number} screenId The ID of the screen
 *
 * @return {object} A data object reprenseting info about the screen.
 */
export async function loadScreenInfo(apiBase, screenId) {
  const response = await Vue.http.get(`${apiBase}kiosign_screens/${screenId}`);

  return response.data;
}

/**
 * Loads schedules from a specific URL.
 *
 * @param {string} url  The URL to retrieve the schedules from.
 *
 * @return {Array<object>} An array of schedule objects
 */
export async function loadSchedules(url) {
  const response = await Vue.http.get(url);

  return transformScheduleData(response.data);
}

export default {
  loadSchedules,
  transformScheduleData,
};
