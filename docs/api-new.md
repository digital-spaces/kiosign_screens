New API Format
==============

The new API format is a format designed to be used in a future custom API within
the KioSigns application. It currently is used internally only with the ACF API
format being transformed into this format before being used by the application.


Screens
-------

A screen represents a physical screen the programs will play on. The options for
screens include:

screen_refresh
: How often to refresh the schedule data for this screen, in minutes

layout
: What layout component to use for the programs on this screen. Valid values
  include: `default` or `split`. If blank or contains an invalid value, defaults
  to the `default` layout.


Programs
--------

A program represents a URL to display combined with a schedule and options for
how to display the URL.

type
: The type of player used for this program. Currently only `iframe` is
  supported.

url
: The URL of the content to play.

priority
: The priority of this program. Programs with higher priorities are played in
  place of programs with lower priorities.

schedule
: The schedule that determines when this program will play.

options
: Options that determine how the URL should be played.


### Schedule

The schedule determines when a program will play. Schedule options include:

days
: The days of the week this program should play on. Valid values include: `sun`,
  `mon`, `tues`, `wed`, `thurs`, `fri`, `sat`

startTime
: The time at which the program should start playing on any given day.

endTime
: The time at which the program should stop playing on any given day.

startDateTime
: The first date and time when this program is valid. It will never play before
  this, but may play after this depending on the `days`, `startTime` and
  `endTime` values.

endDateTime
: The last date and time when this program is valid. It will never play after
  this, but may stop playing before this depending on the `days`, `startTime`
  and `endTime` values.

Schedules that don't define a `startDateTime` or `endDateTime` will always play
on the day of the week they are scheduled for between the `startTime` and the
`endTime`.

If you want a program to play 24 hours a day, use `00:00` as the `startTime` and
`24:00` as the `endTime`.


### Options

enabled
: Whether this program is currently enabled. When set to false, this program
  will never play.

length
: The minimum time in minutes that the URL should be displayed before being
  rotated with other programs, if they are active. If no other programs are
  active for the layout or slot the program is configured for, then this is
  ignored.

transitions [future]
: An array of transitions to use when transitioning between items. Speced out
  for version 2, but not supported yet.


### Example

```
{
  type: 'iframe',
  url: '',
  priority: 10,

  schedule: {
    days:          [ 'mon', 'tue', 'wed' ],
    startTime:     '13:30:00',
    endTime:       '24:00:00',
    startDateTime: '2018-03-13 00:00:00',
    endDateTime:   '2018-03-24 00:00:00'
  },
  options: {
    length: 60,
    transitions: [ 'cut-out' ]
  }
}
```

Note that internally, the Scheduler adds a `nextRun` property to each program
that contains details on when the program is next scheduled to change.
