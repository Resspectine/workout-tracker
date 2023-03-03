import clsx from 'clsx';
import { addDays, differenceInCalendarDays, format, parse } from 'date-fns';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocalStorage } from 'usehooks-ts';
import { ButtonWithConfirmation } from '../ButtonWithConfirmation';
import type { Configuration } from '../TrackerConfiguration';
import { DAYS_OF_WEEK } from '../TrackerConfiguration';
import { CONFIGURATION_KEY } from '../TrackerConfiguration';
import { PaymentForDayForm } from './PaymentForDay';

export type PaymentType = 'skipped' | 'payed' | 'moved';

export type PaymentForDay = {
  day: string;
  payment:
    | {
        type: 'skipped';
      }
    | {
        type: 'payed';
        value: string;
      }
    | {
        type: 'moved';
        value: string;
        movedTo: string;
      };
};

export const PAYED_DAYS_KEY = 'payed-days';

export const DAY_OF_LAST_PAYMENT = 'day-of-last-payment';

const getPayedMessage = (payment: PaymentForDay['payment']) => {
  switch (payment.type) {
    case 'skipped':
      return `Skipped`;
    case 'moved':
    case 'payed':
      return `Payed: ${payment.value}`;
  }
};

const Modal: FC<
  PropsWithChildren<{
    onClose: () => void;
  }>
> = ({ onClose, children }) => {
  return createPortal(
    <div className="absolute top-0 left-0 right-0 bottom-0">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-75" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{children}</div>
    </div>,
    document.body
  );
};

export const Tracker: FC<{ onEditConfiguration: () => void }> = ({ onEditConfiguration }) => {
  const [configuration, setConfiguration] = useLocalStorage<Configuration | null>(CONFIGURATION_KEY, null);
  const [payedTrainings, setPayedTrainings] = useLocalStorage<PaymentForDay[] | null>(PAYED_DAYS_KEY, null);
  const [dayOfLastPayment, setDayOfLastPayment] = useLocalStorage<string | null>(DAY_OF_LAST_PAYMENT, null);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  if (!configuration) {
    return null;
  }

  const resetConfiguration = () => {
    setConfiguration(null);
    setPayedTrainings(null);
    setDayOfLastPayment(null);
    onEditConfiguration();
  };

  const onPayForDay = (dayPayment: PaymentForDay) => {
    setPayedTrainings(oldPayedTrainings => [...(oldPayedTrainings || []), dayPayment]);
    setActiveDay(null);
  };

  const amountOfDaysFromLastPayment =
    dayOfLastPayment && differenceInCalendarDays(Date.now(), new Date(dayOfLastPayment));

  const daysFromLastPayment =
    amountOfDaysFromLastPayment &&
    Array.from({ length: amountOfDaysFromLastPayment + 1 }, (_, index) => addDays(new Date(dayOfLastPayment), index));

  const daysWithPayment =
    daysFromLastPayment &&
    daysFromLastPayment
      .map(day => {
        const currentDayOfWeek = DAYS_OF_WEEK[day.getDay()];
        const displayedCurrentDayOfWeek = format(day, 'E');
        const currentDay = format(day, 'dd.MM');
        const dayPayment = payedTrainings?.find(({ day }) => day == currentDay);
        const isDayPayed = Boolean(dayPayment);
        const isPaymentMoved = dayPayment?.payment.type === 'moved';

        const movedToCurrentDayOfWeek =
          dayPayment?.payment.type === 'moved' && format(parse(dayPayment.payment.movedTo, 'dd.MM', day), 'E');

        console.log(movedToCurrentDayOfWeek);

        if (!currentDayOfWeek) {
          return {
            currentDay,
            currentDayOfWeek: displayedCurrentDayOfWeek,
            shouldPay: false,
          };
        }

        return {
          currentDay,
          currentDayOfWeek: displayedCurrentDayOfWeek,
          shouldPay: configuration.selectedDays[currentDayOfWeek],
          isDayPayed,
          isPaymentMoved,
          dayPayment,
          movedToCurrentDayOfWeek,
        };
      })
      .filter(({ shouldPay }) => shouldPay);

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {activeDay && (
        <Modal onClose={() => setActiveDay(null)}>
          <PaymentForDayForm
            activeDay={activeDay}
            onPayForDay={onPayForDay}
            possiblePayments={configuration.possiblePayments}
          />
        </Modal>
      )}
      <p className="text-4xl text-white">
        Money left:{' '}
        {+configuration.totalPrice -
          ((daysWithPayment &&
            daysWithPayment.reduce(
              (acc, curr) =>
                acc + (curr.dayPayment?.payment.type === 'skipped' ? 0 : +(curr.dayPayment?.payment.value || 0)),
              0
            )) ||
            0)}
      </p>
      <p className="text-center text-4xl text-white">Your training days since last payment:</p>
      <div className="flex flex-wrap gap-4">
        {daysWithPayment &&
          daysWithPayment?.map(
            ({ currentDay, currentDayOfWeek, dayPayment, isDayPayed, isPaymentMoved, movedToCurrentDayOfWeek }) => {
              return (
                <fieldset key={currentDay.toString()} className="flex flex-col items-center gap-2">
                  <button
                    className={clsx(
                      'cursor-pointer flex-col rounded-lg bg-cyan-800 p-5 text-center text-2xl text-white hover:bg-emerald-800',
                      isDayPayed && 'cursor-default bg-green-900 hover:bg-green-900'
                    )}
                    onClick={() => {
                      if (isDayPayed) return;
                      setActiveDay(currentDay);
                    }}
                  >
                    <>
                      <span className={clsx(movedToCurrentDayOfWeek && 'line-through')}>{currentDayOfWeek}</span>
                      {movedToCurrentDayOfWeek && (
                        <>
                          <br />
                          <span>{movedToCurrentDayOfWeek}</span>
                        </>
                      )}
                      <br />
                      <span className={clsx(isPaymentMoved && 'line-through')}>{currentDay}</span>
                      {isPaymentMoved && (
                        <>
                          <br />
                          <span>{dayPayment?.payment.type === 'moved' && dayPayment?.payment.movedTo}</span>
                        </>
                      )}
                    </>
                  </button>
                  {dayPayment && (
                    <p className="text-center text-lg text-white">{getPayedMessage(dayPayment.payment)}</p>
                  )}
                </fieldset>
              );
            }
          )}
      </div>
      <div className="flex flex-col gap-4">
        <fieldset className="flex items-center gap-4 text-white">
          <label htmlFor="day-of-lat-payment" className="text-2xl">
            Day of last payment:
          </label>
          <input
            type="date"
            onChange={event => {
              setDayOfLastPayment(event.target.value);
            }}
            id="day-of-lat-payment"
            value={dayOfLastPayment || new Date().toString()}
            className="cursor-pointer rounded-lg bg-cyan-800 p-3 text-2xl text-white hover:bg-emerald-800"
          />
        </fieldset>
        <button className="btn" onClick={onEditConfiguration}>
          Edit configuration
        </button>
        <ButtonWithConfirmation className="btn bg-red-600 hover:bg-red-700" onClick={resetConfiguration}>
          Reset configuration
        </ButtonWithConfirmation>
      </div>
    </div>
  );
};
