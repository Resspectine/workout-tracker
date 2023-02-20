import clsx from 'clsx';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import React, { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import type { Configuration } from './TrackerConfiguration';
import { DAYS_OF_WEEK } from './TrackerConfiguration';
import { CONFIGURATION_KEY } from './TrackerConfiguration';

export const Tracker = () => {
  const [configuration] = useLocalStorage<Configuration | null>(CONFIGURATION_KEY, null);
  const [dayOfLastPayment, setDayOfLastPayment] = useState<string | null>(null);
  const [payedTrainings, setPayedTrainings] = useState<string[]>([]);

  if (!configuration) {
    return null;
  }

  const onJustPaidClick = () => {
    const date = new Date();
    date.setDate(1);
    setDayOfLastPayment(date.toISOString());
  };

  const amountOfDaysFromLastPayment =
    dayOfLastPayment && differenceInCalendarDays(Date.now(), new Date(dayOfLastPayment));

  const daysFromLastPayment =
    amountOfDaysFromLastPayment &&
    Array.from({ length: amountOfDaysFromLastPayment + 1 }, (_, index) => addDays(new Date(dayOfLastPayment), index));

  const daysWithPayment =
    daysFromLastPayment &&
    daysFromLastPayment.map(day => {
      const currentDayOfWeek = DAYS_OF_WEEK[day.getDay()];

      if (!currentDayOfWeek) {
        return {
          currentDay: format(day, 'dd.MM'),
          currentDayOfWeek: format(day, 'E'),
          shouldPay: false,
        };
      }

      return {
        currentDay: format(day, 'dd.MM'),
        currentDayOfWeek: format(day, 'E'),
        shouldPay: configuration.selectedDays[currentDayOfWeek],
      };
    });

  console.log(daysWithPayment);

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <p className="text-4xl text-white">Your training days since last payment:</p>
      <div className="flex flex-wrap gap-4">
        {daysWithPayment &&
          daysWithPayment
            .filter(({ shouldPay }) => shouldPay)
            .map(({ currentDay, currentDayOfWeek }) => (
              <fieldset key={currentDay.toString()} className="flex">
                <input
                  id={`day-${currentDay.toString()}`}
                  type="checkbox"
                  value={currentDay.toString()}
                  className="hidden"
                  checked={!!payedTrainings.find(payedDay => payedDay == currentDay)}
                  onChange={() =>
                    setPayedTrainings(oldPayedDays => {
                      const isDayPayed = oldPayedDays.find(payedDay => payedDay === currentDay);

                      return isDayPayed
                        ? oldPayedDays.filter(payedDay => payedDay !== currentDay)
                        : [...oldPayedDays, currentDay];
                    })
                  }
                />
                <label
                  htmlFor={`day-${currentDay.toString()}`}
                  className={clsx(
                    'cursor-pointer flex-col rounded-lg bg-cyan-800 p-5 text-center text-2xl text-white hover:bg-emerald-800',
                    !!payedTrainings.find(payedDay => payedDay == currentDay) && 'bg-green-900'
                  )}
                >
                  <>
                    {currentDayOfWeek}
                    <br />
                    {currentDay}
                  </>
                </label>
              </fieldset>
            ))}
      </div>
      <button className="btn" onClick={onJustPaidClick}>
        Just paid
      </button>
    </div>
  );
};
