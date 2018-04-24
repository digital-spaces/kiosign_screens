import Eventable from '../../utils/Eventable';

/**
 * A class used to rotate through a list of programs, allowing them to play for
 * a specific amount of time before rotating to the next one.
 *
 * # Events
 *
 * activate
 * : Fired when a program is activated
 */
export default class Rotater extends Eventable {
  /**
   * The list of potential programs this rotator rotates through.
   *
   * @type {Array}
   */
  programs = [];

  /**
   * The index of the current program.
   *
   * @type {Number}
   */
  currentIndex = -1;

  /**
   * Maps programs to the timers being used to keep track of the next update for
   * each program.
   *
   * @type {Map}
   */
  timer = undefined;

  /**
   * Updates the programs for this rotator. Use this method instead of setting
   * the property directly on this object to allow the rotator to update
   * correctly.
   *
   * @param {Array} programs The list of programs to rotate through
   */
  updatePrograms(programs) {
    const oldPrograms = this.programs;

    this.programs = programs || [];

    // Does any new program match the currently running program? If so, just set
    // the index to it and allow the existing timer and program to play
    if (programs && oldPrograms) {
      const oldProgram = oldPrograms[this.currentIndex];
      const newIndex = programs.findIndex(program => program.isEquivalent(oldProgram));

      if (newIndex >= 0) {
        this.currentIndex = newIndex;

        if (this.timer) {
          return;
        }
      }
    }

    this.activateProgram();
  }

  /**
   * Activates the program and sets a timer to rotate in the next program when
   * this one is done.
   *
   * @param {object} program The program to activate
   */
  activateProgram() {
    const oldProgram = this.programs[this.currentIndex];

    this.currentIndex = this.programs.length ? (this.currentIndex + 1) % this.programs.length : -1;

    const program = this.programs[this.currentIndex];

    // Cancel any timer that exists
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (program && !program.isEquivalent(oldProgram)) {
      this.fire('activate', program);

      // Only schedule the rotater if we have more than one program
      if (this.programs.length > 1) {
        this.timer = setTimeout(() => this.activateProgram(), program.options.length * 1000);
      }
    } else {
      // TODO: Fire 'noProgram' event?
    }
  }
}
