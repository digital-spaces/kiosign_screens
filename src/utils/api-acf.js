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
 * Converts empty strings to undefined; if the value is not an empty string,
 * does nothing.
 *
 * @param {string} value A value to convert to undefined
 *
 * @return {string} The value, or undefined if the value was an empty string
 */
function convertBlanks(value) {
  return value !== '' ? value : undefined;
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
 * Returns true if the data uses the ACF API format.
 *
 * @param {object} data A data response from an API
 *
 * @return {Boolean} true if the data is in ACF API format; false otherwise
 */
export function usesAcfFormat(data) {
  return data != null && data.acf != null;
}

/**
 * Transforms a program in ACF format from the API into the new format that will
 * be used when a custom API is created.
 *
 * @param {object} program The program in ACF format
 *
 * @return {object} The program in the new format
 */
export function transformAcfProgram(program) {
  const result = {
    // The type of content to display--for now only supporting iframes
    type: 'iframe',

    // The URL to the content
    url: program.content && fixGuidHack(program.content.guid),

    priority: program.priority,

    schedule: {
      // The days and times to schedule the content if repeating
      days: program.play_days,
      startTime: convertBlanks(program.play_start),
      endTime: convertBlanks(program.play_end),

      // Specific start and end times to play the content
      startDateTime: convertBlanks(program.publish_datetime),
      endDateTime: convertBlanks(program.unpublish_datetime),
    },

    // Options for playing the content
    options: {
      enabled: program.play_disable !== true,
      length: parseInt(program.play_length),
      transitions: null,
    },
  };

  if (program.play_exact) {
    result.priority = 10;
    result.schedule.startTime = '00:00';
    result.schedule.endTime = '24:00';
    result.schedule.days = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
  }

  return result;
}

/**
 * Transforms the data returned from the ACF API into program configurations
 * that can be used to create a Program in the Scheduler.
 *
 * @param {object} data The data returned from the API
 *
 * @return {Array<object>} An array of schedule objects
 */
export function transformAcfData(data) {
  const programs = [];

  if (data && data.acf && data.acf.schedule_repeater) {
    data.acf.schedule_repeater.forEach((program) => {
      programs.push(transformAcfProgram(program));
    });
  } else {
    throw new Error('Cannot find program data in ACF data');
  }

  return programs;
}
