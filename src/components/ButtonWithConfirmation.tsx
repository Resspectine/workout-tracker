import clsx from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';

export const ButtonWithConfirmation: FC<
  PropsWithChildren<{
    onClick: () => void;
    className?: string;
  }>
> = ({ children, onClick, className }) => {
  const [isConfirmationStep, setIsConfirmationStep] = useState(false);

  const onButtonClick = () => {
    if (!isConfirmationStep) {
      setIsConfirmationStep(true);

      return;
    }

    onClick();
    setIsConfirmationStep(false);
  };

  return (
    <button className={clsx('btn', className)} onClick={onButtonClick}>
      {isConfirmationStep ? `Click again to confirm` : children}
    </button>
  );
};
