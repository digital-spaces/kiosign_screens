import {
  usesAcfFormat,
  transformAcfProgram,
} from '@/utils/api-acf';

describe('usesAcfFormat is a function that', () => {
  it('returns true when the data is in ACF format', () => {
    const data = {
      acf: {},
    };

    expect(usesAcfFormat(data)).toBe(true);
  });

  it('returns false when the data is not in ACF format', () => {
    const data = {};

    expect(usesAcfFormat(data)).toBe(false);
    expect(usesAcfFormat(undefined)).toBe(false);
  });
});

describe('transformAcfProgram is a function that', () => {
  it('returns the new API format when passed data in the ACF format', () => {
    const data = {
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
    };

    expect(transformAcfProgram(data)).toMatchObject({
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
  });

  it('returns the new API format when passed extraneous data', () => {
    const data = {
      content: {
        ID: 336,
        post_author: '3',
        post_date: '2018-03-14 01:37:20',
        post_date_gmt: '2018-03-14 01:37:20',
        post_content: '<h2>This is default Content</h2>',
        post_title: 'Default Slide1',
        post_excerpt: '',
        post_status: 'publish',
        post_name: 'default-slide1',
        post_modified: '2018-03-14 01:40:42',
        post_modified_gmt: '2018-03-14 01:40:42',
        post_content_filtered: '',
        post_parent: 0,
        guid: 'http://www.abtcomputertech.com/kiosign/?post_type=kiosign_slides&#038;p=336',
        menu_order: 0,
        post_type: 'kiosign_slides',
      },
      publish_datetime: '2018-03-13 00:00:00',
      unpublish_datetime: '2018-03-21 00:00:00',
      play_disable: false,
      play_length: '10',
      play_days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
      play_start: '00:00',
      play_end: '24:00',
      play_exact: false,
    };

    expect(transformAcfProgram(data)).toMatchObject({
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
  });

  it('returns "play_exact" programs as high priority 24/7 schedules', () => {
    let data = {
      publish_datetime: '2018-03-13 00:00:00',
      unpublish_datetime: '2018-03-21 00:00:00',
      play_days: ['thurs'],
      play_start: '01:00',
      play_end: '02:00',
      play_exact: true,
    };

    expect(transformAcfProgram(data)).toMatchObject({
      priority: 10,
      schedule: {
        days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
        startTime: '00:00',
        endTime: '24:00',

        startDateTime: '2018-03-13 00:00:00',
        endDateTime: '2018-03-21 00:00:00',
      },
    });

    data = {
      publish_datetime: '2018-03-13 00:00:00',
      unpublish_datetime: '2018-03-21 00:00:00',
      play_exact: true,
    };

    expect(transformAcfProgram(data)).toMatchObject({
      priority: 10,
      schedule: {
        days: ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'],
        startTime: '00:00',
        endTime: '24:00',

        startDateTime: '2018-03-13 00:00:00',
        endDateTime: '2018-03-21 00:00:00',
      },
    });
  });
});
