import screens from './screens.json';
import schedules from './schedules.json';

export default {
  'GET */wp-json/acf/v3/kiosign_screens/*': (pathMatch) => {
    const id = pathMatch._[1];

    return {
      body: screens[id],
      status: 200,
      statusText: 'OK',
    };
  },

  'GET */wp-json/acf/v3/kiosign_schedules/*': (pathMatch) => {
    const id = pathMatch._[1];

    return {
      body: schedules[id],
      status: 200,
      statusText: 'OK',
    };
  },
};
