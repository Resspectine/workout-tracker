import type { FC, ChangeEventHandler } from 'react';
import React, { useState } from 'react';
import clsx from 'clsx';
import { useLocalStorage } from 'usehooks-ts';

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'] as const;

export const CONFIGURATION_KEY = 'saved-configuration';

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export type Configuration = {
  selectedDays: Record<DayOfWeek, boolean>;
  possiblePayments: Payment[];
  totalPrice: string;
};

type Payment = {
  paymentName: string;
  paymentCost: string;
};

type PossiblePaymentProps = {
  payment: Payment;
  isLast: boolean;
  isRemovable: boolean;
  addPayment: () => void;
  deletePayment: () => void;
  changeInputValue: ChangeEventHandler<HTMLInputElement>;
};

const PossiblePayment: FC<PossiblePaymentProps> = ({
  payment: { paymentCost, paymentName },
  isLast,
  addPayment,
  changeInputValue,
  deletePayment,
  isRemovable,
}) => {
  const isInputsFilled = paymentCost.length && paymentName.length;

  return (
    <>
      <fieldset className="grid grid-cols-[minmax(0,_1fr)_32px_32px] gap-4 text-white">
        <div className="flex items-center gap-4">
          <input
            id="amount-of-possible-costs"
            type="text"
            className="h-10 rounded-lg border border-cyan-500 bg-transparent p-2 text-lg text-white"
            value={paymentName}
            name="paymentName"
            onChange={changeInputValue}
          />
          :
          <input
            id="amount-of-possible-costs"
            type="number"
            className="h-10 w-20 rounded-lg border border-cyan-500 bg-transparent p-2 text-right text-lg text-white"
            value={paymentCost}
            name="paymentCost"
            onChange={changeInputValue}
          />
        </div>
        {isRemovable && (
          <button onClick={deletePayment}>
            <svg
              className="h-8 w-8 text-red-600 hover:text-red-800"
              fill="currentColor"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
              <path
                fillRule="evenodd"
                d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {!!isLast && !!isInputsFilled && (
          <button onClick={addPayment}>
            <svg
              className="h-8 w-8 hover:text-gray-400"
              fill="currentColor"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M474 152m8 0l60 0q8 0 8 8l0 704q0 8-8 8l-60 0q-8 0-8-8l0-704q0-8 8-8Z" />
              <path d="M168 474m8 0l672 0q8 0 8 8l0 60q0 8-8 8l-672 0q-8 0-8-8l0-60q0-8 8-8Z" />
            </svg>
          </button>
        )}
      </fieldset>
    </>
  );
};

export const TrackerConfiguration: FC<{
  onConfigurationSave: () => void;
}> = ({ onConfigurationSave }) => {
  const [savedConfiguration, setConfiguration] = useLocalStorage<Configuration | null>(CONFIGURATION_KEY, null);

  const [selectedDays, setSelectedDays] = useState<Record<DayOfWeek, boolean>>(
    savedConfiguration?.selectedDays ??
      DAYS_OF_WEEK.reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: false,
        }),
        {} as Record<DayOfWeek, boolean>
      )
  );
  const [possiblePayments, setPossiblePayments] = useState<Payment[]>(
    savedConfiguration?.possiblePayments ?? [
      {
        paymentCost: '140',
        paymentName: 'Double',
      },
    ]
  );
  const [totalPrice, setTotalPrice] = useState<string>(savedConfiguration?.totalPrice ?? '');

  const onAddPaymentClick = () => {
    setPossiblePayments(oldPossiblePayments => [
      ...oldPossiblePayments,
      {
        paymentCost: '',
        paymentName: '',
      },
    ]);
  };

  const onDeletePaymentClick = (index: number) => {
    setPossiblePayments(oldPossiblePayments => oldPossiblePayments.filter((_, paymentIndex) => index !== paymentIndex));
  };

  const onPaymentValuesChange =
    (index: number): ChangeEventHandler<HTMLInputElement> =>
    event => {
      setPossiblePayments(oldPossiblePayments =>
        oldPossiblePayments.map((oldPossiblePayment, oldPossiblePaymentIndex) =>
          oldPossiblePaymentIndex === index
            ? {
                ...oldPossiblePayment,
                [event.target.name]: event.target.value,
              }
            : oldPossiblePayment
        )
      );
    };

  const onSaveConfigurationClick = () => {
    setConfiguration({
      selectedDays,
      possiblePayments,
      totalPrice,
    });
    onConfigurationSave();
  };

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <p className="text-4xl text-white">Select days of your trainings:</p>
      <div className="flex gap-2 ">
        {DAYS_OF_WEEK.map(day => (
          <fieldset key={day} className="flex">
            <input
              id={`day-${day}`}
              type="checkbox"
              checked={selectedDays[day]}
              value={day}
              className="hidden"
              onChange={() =>
                setSelectedDays(oldSelectedDays => ({
                  ...oldSelectedDays,
                  [day]: !oldSelectedDays[day],
                }))
              }
            />
            <label
              htmlFor={`day-${day}`}
              className={clsx(
                'cursor-pointer flex-col rounded-lg bg-cyan-800 p-5 text-2xl text-white hover:bg-emerald-800',
                selectedDays[day] && 'bg-green-900'
              )}
            >
              {day}
            </label>
          </fieldset>
        ))}
      </div>
      <fieldset className="flex items-center gap-4">
        <label htmlFor="total-price" className="text-4xl text-white">
          Add total price:
        </label>
        <input
          id="total-price"
          type="number"
          value={totalPrice}
          onChange={event => setTotalPrice(event.target.value)}
          className="h-10 w-20 rounded-lg border border-cyan-500 bg-transparent p-2 text-right text-lg text-white"
        />
      </fieldset>
      <p className="text-4xl text-white">Add possible payments:</p>
      <div className="flex flex-col gap-4">
        {possiblePayments.map((payment, index) => (
          <PossiblePayment
            payment={payment}
            key={index}
            isLast={index === possiblePayments.length - 1}
            isRemovable={possiblePayments.length !== 1}
            addPayment={onAddPaymentClick}
            deletePayment={() => onDeletePaymentClick(index)}
            changeInputValue={onPaymentValuesChange(index)}
          />
        ))}
      </div>
      <button className="btn" onClick={onSaveConfigurationClick}>
        Save configuration
      </button>
    </div>
  );
};
