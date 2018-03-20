export default class Eventable {
  listeners = {};

  /**
   * Registers the `listener` for the `event`.
   *
   * @param {string}   event    The name of the event to listen to
   * @param {Function} listener The function to call when the event is triggered
   */
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new Error('The \'listener\' parameter must be a function');
    }

    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
  }

  /**
   * Unregisters the `listener` for the `event`.
   *
   * @param {string}   event    The name of the event to listen to
   * @param {Function} listener The listener function to remove, or undefined to
   *                            remove all listeners for the event
   *
   * @returns {Boolean} true if an event listener was removed; false otherwise
   */
  off(event, listener) {
    const listeners = this.listeners;
    const oldListeners = listeners[event];

    if (typeof listener === 'undefined') {
      listeners[event] = [];

      return oldListeners.length > 0;
    } else if (listeners[event] == null || listeners[event].length === 0) {
      return false;
    }

    listeners[event] = listeners[event].filter(item => item !== listener);

    return oldListeners.length > listeners[event].length;
  }

  /**
   * Fires the `event` with the `args`, calling each registered listener for
   * that event.
   *
   * @param {string} event The name of the event to fire
   * @param {...*}   args  The arguments to pass to the listener
   *
   * @returns {Boolean} true if one or more event listeners were called; false
   *                    otherwise
   */
  fire(event, ...args) {
    const listeners = this.listeners[event];

    if (listeners && listeners.length) {
      listeners.forEach(listener => listener(...args));
      return true;
    }

    return false;
  }
}
