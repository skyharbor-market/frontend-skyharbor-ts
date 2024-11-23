import React from 'react';
import CustomDropdown from '../CustomDropdown/CustomDropdown';

export type SortOption = {
  label: string;
  value: string;
  orderBy: any;
};

export const SORT_OPTIONS: SortOption[] = [
  { 
    label: 'Recently Listed', 
    value: 'recent',
    orderBy: [{ list_time: 'desc' }]
  },
  { 
    label: 'Oldest Listed', 
    value: 'oldest',
    orderBy: [{ list_time: 'asc' }]
  },
  { 
    label: 'Price: Low to High', 
    value: 'price_asc',
    orderBy: [{ nerg_sale_value: 'asc' }]
  },
  { 
    label: 'Price: High to Low', 
    value: 'price_desc',
    orderBy: [{ nerg_sale_value: 'desc' }]
  }
];

interface SortDropdownProps {
  value: string;
  onChange: (option: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <CustomDropdown
      value={value}
      items={SORT_OPTIONS.map(option => ({
        label: option.label,
        value: option.value
      }))}
      onChange={(selected) => {
        // @ts-ignore
        const option = SORT_OPTIONS.find(opt => opt.value === selected.value);
        if (option) {
          onChange(option);
        }
      }}
    //   placeholder="Sort by"
    />
  );
} 