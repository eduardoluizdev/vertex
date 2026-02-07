'use client';

import { forwardRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface MaskedInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  mask: (value: string) => string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, ...props }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = mask(e.target.value);
        onChange?.(e);
      },
      [mask, onChange],
    );

    return <Input ref={ref} onChange={handleChange} {...props} />;
  },
);

MaskedInput.displayName = 'MaskedInput';
