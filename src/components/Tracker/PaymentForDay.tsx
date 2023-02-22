import clsx from 'clsx';
import { format } from 'date-fns';
import type { FC } from 'react';
import { useState } from 'react';
import type { Configuration } from '../TrackerConfiguration';
import type { PaymentForDay, PaymentType } from './Tracker';

export const PaymentForDayForm: FC<{
  possiblePayments: Configuration['possiblePayments'];
  onPayForDay: (paymentForDay: PaymentForDay) => void;
  activeDay: string;
}> = ({ possiblePayments, onPayForDay, activeDay }) => {
  const [isMovedTo, setIsMovedTo] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [currentPaymentCost, setCurrentPaymentCost] = useState<string>('');
  const [dayMovedTo, setDayMovedTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const isSaveButtonDisabled =
    !paymentType || ((paymentType === 'moved' || paymentType === 'payed') && !currentPaymentCost);

  const onSaveClick = () => {
    if (!paymentType) return;

    if (paymentType === 'moved') {
      onPayForDay({
        day: activeDay,
        payment: {
          type: paymentType,
          movedTo: format(new Date(dayMovedTo), 'dd.MM'),
          value: currentPaymentCost,
        },
      });

      return;
    }

    if (paymentType === 'skipped') {
      onPayForDay({
        day: activeDay,
        payment: {
          type: paymentType,
        },
      });

      return;
    }

    if (paymentType === 'payed') {
      onPayForDay({
        day: activeDay,
        payment: {
          type: paymentType,
          value: currentPaymentCost,
        },
      });

      return;
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-10">
      <div className="flex flex-col gap-2">
        <fieldset className="flex items-center justify-between gap-2">
          <input
            type="checkbox"
            checked={isMovedTo}
            onChange={event => {
              const checked = event.target.checked;

              if (checked) setPaymentType('moved');

              setIsMovedTo(checked);
            }}
            className="h-6 w-6 rounded-xl border-gray-300 bg-gray-100 focus:ring-2 focus:ring-green-900 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-green-900"
          />
          <fieldset className="flex items-center gap-2">
            <label htmlFor="date-moved-to" className="text-2xl">
              Moved to:
            </label>
            <input
              type="date"
              id="date-moved-to"
              onChange={event => {
                setDayMovedTo(event.target.value);
                setIsMovedTo(true);
                setPaymentType('moved');
              }}
              value={dayMovedTo}
              className="cursor-pointer rounded-lg bg-cyan-800 p-3 text-2xl text-white hover:bg-emerald-800"
            />
          </fieldset>
        </fieldset>
        <button
          className={clsx('btn', paymentType === 'skipped' && 'bg-green-900')}
          onClick={() => {
            setPaymentType('skipped');
            setIsMovedTo(false);
            setCurrentPaymentCost('');
          }}
        >
          Skipped
        </button>
        <div className="flex-c flex flex-wrap gap-2">
          {possiblePayments.map(({ paymentCost, paymentName }, index) => (
            <button
              className={clsx('btn', currentPaymentCost === paymentCost && 'bg-green-900')}
              key={index}
              onClick={() => {
                if (paymentType !== 'moved') setPaymentType('payed');

                setCurrentPaymentCost(paymentCost);
              }}
            >
              {paymentName}: {paymentCost}
            </button>
          ))}
        </div>
      </div>
      <button className="btn" disabled={isSaveButtonDisabled} onClick={onSaveClick}>
        Save
      </button>
    </div>
  );
};
