/**
 * Returns `currentDay` if it exists in `days`, otherwise the next day in after
 * `currentDay` that exists in `days`. For the integer value, Sunday is day 0
 * and Saturday is day 6.
 *
 * @param {Array<integer>} days       An ascending sorted array of days
 * @param {integer}        currentDay The current day, expressed as an integer
 *
 * @return {integer} The next future day expressed as an integer
 */
export function getFutureDay(days, currentDay) {
  return days.find(day => day >= currentDay) || days[0];
}

/**
 * Returns `currentDay` if it exists in `days`, otherwise the previous day
 * before `currentDay` that exists in `days`. For the integer value, Sunday is
 * day 0 and Saturday is day 6.
 *
 * @param {Array<integer>} days       An ascending sorted array of days
 * @param {integer}        currentDay The current day, expressed as an integer
 *
 * @return {integer} The previous past day expressed as an integer
 */
export function getPastDay(days, currentDay) {
  const reverseDays = days.slice().reverse();

  return reverseDays.find(day => day <= currentDay) || days[days.length - 1];
}

/**
 * Sets the time for the `dateTime` to the same time specified by `time`.
 *
 * @param {moment} dateTime The datetime whose time should be set
 * @param {moment} time     A moment specifying the time to set
 *
 * @return {moment} The datetime passed in as `dateTime`
 */
export function setTime(dateTime, time) {
  dateTime.hour(time.hour());
  dateTime.minute(time.minute());
  dateTime.second(time.second());
  dateTime.milliseconds(time.milliseconds());

  return dateTime;
}

/**
 * Returns true if `time` represents midnight; false otherwise.
 *
 * @param {moment} time The time to check
 *
 * @return {Boolean} true if `time` represents midnight; false otherwise.
 */
export function isMidnight(time) {
  return time && time.hour() === 0 && time.minute() === 0 && time.second() === 0;
}

