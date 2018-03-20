import moment from 'moment';
import Program from '@/services/scheduler/Program';

function timeComponents(time) {
  return {
    hour: time.hour(),
    minute: time.minute(),
    second: time.second(),
  };
}

describe('Program is a class that', () => {
  it('should correctly initialize when given an empty config', () => {
    const program = new Program();

    expect(program.isEnabled).toBe(true);
    expect(program.type).toBe(undefined);
    expect(program.url).toBe(undefined);
    expect(program.options).toBe(undefined);

    expect(program.schedule.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(program.schedule.startDateTime).toEqual(undefined);
    expect(program.schedule.endDateTime).toEqual(undefined);
    expect(timeComponents(program.schedule.startTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(timeComponents(program.schedule.endTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });
  });

  it('should correctly initialize when given a full config', () => {
    const program = new Program({
      type: 'iframe',
      url: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&p=336',
      schedule: {
        days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
        startTime: '00:00',
        endTime: '24:00',

        startDateTime: '2018-03-13 00:00:00',
        endDateTime: '2018-03-21 00:00:00',
      },
      options: {
        enabled: true,
        length: 10,
      },
    });

    expect(program.isEnabled).toBe(true);
    expect(program.type).toBe('iframe');
    expect(program.url).toBe('http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&p=336');
    expect(program.options).toMatchObject({ length: 10 });

    expect(program.schedule.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(program.schedule.startDateTime).toEqual(moment('2018-03-13 00:00:00'));
    expect(program.schedule.endDateTime).toEqual(moment('2018-03-21 00:00:00'));
    expect(timeComponents(program.schedule.startTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(timeComponents(program.schedule.endTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });
  });

  it('can be initialized from itself', () => {
    const program = new Program(new Program({
      type: 'iframe',
      url: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&p=336',
      schedule: {
        days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
        startTime: '00:00',
        endTime: '24:00',

        startDateTime: '2018-03-13 00:00:00',
        endDateTime: '2018-03-21 00:00:00',
      },
      options: {
        enabled: true,
        length: 10,
      },
    }));

    expect(program.isEnabled).toBe(true);
    expect(program.type).toBe('iframe');
    expect(program.url).toBe('http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&p=336');
    expect(program.options).toMatchObject({ length: 10 });

    expect(program.schedule.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(program.schedule.startDateTime).toEqual(moment('2018-03-13 00:00:00'));
    expect(program.schedule.endDateTime).toEqual(moment('2018-03-21 00:00:00'));
    expect(timeComponents(program.schedule.startTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(timeComponents(program.schedule.endTime)).toMatchObject({
      hour: 0,
      minute: 0,
      second: 0,
    });

  });
});
