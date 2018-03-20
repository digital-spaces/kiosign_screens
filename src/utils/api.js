import Vue from 'vue';
import { usesAcfFormat, transformAcfData } from './api-acf';

/**
 * Transforms the data returned from the API into schedule objects that can be
 * passed to the Scheduler.
 *
 * @param {object} data The data returned from the API
 *
 * @return {Array<object>} An array of schedule objects
 */
export function transformProgramData(data) {
  let programs = [];

  if (usesAcfFormat(data)) {
    programs = transformAcfData(data);
  } else if (data.programs) {
    programs = data.programs;
  } else {
    throw new Error('No schedule data exists in response from server');
  }

  return programs;
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
 * Loads programs from a specific URL.
 *
 * @param {string} url  The URL to retrieve the programs from.
 *
 * @return {Array<object>} An array of program objects
 */
export async function loadPrograms(url) {
  const response = await Vue.http.get(url);

  return transformProgramData(response.data);
}
