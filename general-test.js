import moment from "moment";

class WorkdayCalendar {
  constructor() {
    this.date = new Date();

    this.month = 0;
    this.day = 0;
    this.holiday = [];

    this.startHours = 0;
    this.startMinutes = 0;

    this.stopHours = 0;
    this.stopMinutes = 0;
  }

  setHoliday(date) {
    this.holiday = [...this.holiday, moment(date)];
  }

  setRecurringHoliday(month, day) {
    this.month = month;
    this.day = day;
    this.holiday = [
      ...this.holiday,
      moment()
        .month(month)
        .date(day)
    ];
  }

  setWorkdayStartAndStop(startHours, startMinutes, stopHours, stopMinutes) {
    this.startHours = startHours;
    this.startMinutes = startMinutes;
    this.stopHours = stopHours;
    this.stopMinutes = stopMinutes;
  }

  getWorkdayIncrement(startDate = null, incrementInWorkdays = 0) {
    if (startDate !== null && incrementInWorkdays !== 0) {
      startDate = moment(startDate);
      const myDate = moment(startDate);
      const truncIncrementWorkDay = Math.trunc(incrementInWorkdays);
      /*------------- */
      const prevOrNextDay =
        truncIncrementWorkDay > 0
          ? moment(myDate).date(1, "days")
          : moment(myDate).date(-1, "days");

      const stepper = (days = 0) => {
        myDate.add(days, "days");
        prevOrNextDay.add(days, "days");
      };

      let isHoliday = null;

      const cantWork = workDays => {
        while (workDays > 0) {
          isHoliday = this.holiday.find(
            holiday =>
              holiday.date() === prevOrNextDay.date() &&
              holiday.month() === prevOrNextDay.month()
          );
          if (truncIncrementWorkDay > 0) {
            if (prevOrNextDay.day() === 6) {
              stepper(3);
              workDays--;
            } else if (!isHoliday) {
              stepper(1);
              workDays--;
            } else {
              stepper(1);
            }
          } else if (truncIncrementWorkDay < 0) {
            if (prevOrNextDay.day() === 0) {
              stepper(-3);
            } else if (!isHoliday) {
              stepper(-1);
              workDays--;
            } else {
              stepper(-1);
            }
          }
        }
      };

      const workDays = Math.abs(truncIncrementWorkDay);
      const timePlayer = Math.abs(incrementInWorkdays % truncIncrementWorkDay);

      cantWork(workDays);

      const minutesToRealTimeDuration = minutes => ({
        hours: Math.floor(minutes / 60),
        minutes: Math.trunc((minutes / 60 - Math.floor(minutes / 60)) * 60)
      });

      if (timePlayer) {
        const myDateMinutes = myDate.hours() * 60 + myDate.minutes();
        const stopWorkMinutes = this.stopHours * 60 + this.stopMinutes;
        const startWorkMinutes = this.startHours * 60 + this.startMinutes;
        const addMissedDuration =
          (stopWorkMinutes - startWorkMinutes) * timePlayer;
        const missedHM = minutesToRealTimeDuration(addMissedDuration);
        if (myDateMinutes >= stopWorkMinutes) {
          stepper(1);
          myDate
            .hours(this.startHours + missedHM.hours)
            .minutes(this.startMinutes + missedHM.minutes);
        } else if (myDateMinutes >= startWorkMinutes) {
          const startToFinishDuration = myDateMinutes + addMissedDuration;
          const remaining = stopWorkMinutes - startToFinishDuration;
          const {
            hours: startToFinishDurationHours,
            minutes: startToFinishDurationMinutes
          } = minutesToRealTimeDuration(startToFinishDuration);

          const { hours, minutes } = minutesToRealTimeDuration(
            Math.abs(remaining)
          );
          myDate.hours(this.startHours + hours).minutes(minutes);

          if (remaining < 0) {
            if (prevOrNextDay.day() === 6) {
              // when next day is saturday
              stepper(3);
            } else if (
              this.holiday.find(
                holiday =>
                  holiday.date() === prevOrNextDay.date() &&
                  holiday.month() === prevOrNextDay.month()
              )
            ) {
              stepper(1);
              if (prevOrNextDay.day() === 6) {
                // when after holiday is saturday
                stepper(3);
              } else if (prevOrNextDay.day() === 0) {
                // when after holiday is sunday
                stepper(2);
              }
            } else {
              // when every thing is easy
              stepper(1);
            }
            myDate.hours(this.startHours + hours).minutes(minutes);
          } else {
            myDate
              .hours(startToFinishDurationHours)
              .minutes(startToFinishDurationMinutes);
          }
        } else {
          myDate
            .hours(this.startHours + missedHM.hours)
            .minutes(missedHM.minutes);
        }
      }

      console.log(
        `${startDate.date()}-${startDate.month()}-${startDate.year()}  ${startDate.hours()}:${startDate.minutes()} with an additional of ${incrementInWorkdays} work days is ${myDate.date()}-${myDate.month()}-${myDate.year()}  ${myDate.hours()}:${myDate.minutes()} `
      );

      return myDate;
    }
  }
}

let calendar = new WorkdayCalendar();
calendar.setWorkdayStartAndStop(8, 0, 16, 0);
calendar.setHoliday(new Date(2004, 5, 27));
calendar.setRecurringHoliday(5, 17);
calendar.getWorkdayIncrement(new Date(2004, 5, 24, 19, 3), 44.723656);
