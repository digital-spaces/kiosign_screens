import {
  transformProgramData,
} from '@/utils/api';

describe('transformProgramData is a function that', () => {
  it('returns an array of programs when provided data in ACF format', () => {
    const data = {
      acf: {
        schedule_repeater: [{
          content: {
            guid: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&#038;p=336',
          },
          publish_datetime: '2018-03-13 00:00:00',
          unpublish_datetime: '2018-03-21 00:00:00',
          play_disable: false,
          play_length: '10',
          play_days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
          play_start: '00:00',
          play_end: '24:00',
          play_exact: false,
        }, {
          content: {
            guid: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&#038;p=442',
          },
          publish_datetime: '',
          unpublish_datetime: '',
          play_disable: false,
          play_length: '20',
          play_days: ['mon', 'tues', 'wed', 'thurs', 'fri'],
          play_start: '08:00',
          play_end: '09:00',
          play_exact: false,
        }],
      },
    };

    const programs = transformProgramData(data);

    expect(programs.length).toBe(2);
    expect(programs).toMatchObject([{
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
    }, {
      type: 'iframe',
      url: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&p=442',
      schedule: {
        days: ['mon', 'tues', 'wed', 'thurs', 'fri'],
        startTime: '08:00',
        endTime: '09:00',

        startDateTime: undefined,
        endDateTime: undefined,
      },
      options: {
        enabled: true,
        length: 20,
      },
    }]);
  });
});

