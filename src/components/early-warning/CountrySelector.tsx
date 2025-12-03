import { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Globe } from 'lucide-react';

// African Regional Economic Communities with member countries
export const REGIONAL_BLOCKS = {
  'AU': {
    name: 'African Union',
    countries: [
      { code: 'ALL', name: 'All African Countries' }
    ]
  },
  'COMESA': {
    name: 'Common Market for Eastern and Southern Africa',
    countries: [
      { code: 'BI', name: 'Burundi' },
      { code: 'KM', name: 'Comoros' },
      { code: 'CD', name: 'DR Congo' },
      { code: 'DJ', name: 'Djibouti' },
      { code: 'EG', name: 'Egypt' },
      { code: 'ER', name: 'Eritrea' },
      { code: 'SZ', name: 'Eswatini' },
      { code: 'ET', name: 'Ethiopia' },
      { code: 'KE', name: 'Kenya' },
      { code: 'LY', name: 'Libya' },
      { code: 'MG', name: 'Madagascar' },
      { code: 'MW', name: 'Malawi' },
      { code: 'MU', name: 'Mauritius' },
      { code: 'RW', name: 'Rwanda' },
      { code: 'SC', name: 'Seychelles' },
      { code: 'SD', name: 'Sudan' },
      { code: 'TN', name: 'Tunisia' },
      { code: 'UG', name: 'Uganda' },
      { code: 'ZM', name: 'Zambia' },
      { code: 'ZW', name: 'Zimbabwe' },
    ]
  },
  'SADC': {
    name: 'Southern African Development Community',
    countries: [
      { code: 'AO', name: 'Angola' },
      { code: 'BW', name: 'Botswana' },
      { code: 'CD', name: 'DR Congo' },
      { code: 'SZ', name: 'Eswatini' },
      { code: 'LS', name: 'Lesotho' },
      { code: 'MG', name: 'Madagascar' },
      { code: 'MW', name: 'Malawi' },
      { code: 'MU', name: 'Mauritius' },
      { code: 'MZ', name: 'Mozambique' },
      { code: 'NA', name: 'Namibia' },
      { code: 'SC', name: 'Seychelles' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'TZ', name: 'Tanzania' },
      { code: 'ZM', name: 'Zambia' },
      { code: 'ZW', name: 'Zimbabwe' },
    ]
  },
  'ECOWAS': {
    name: 'Economic Community of West African States',
    countries: [
      { code: 'BJ', name: 'Benin' },
      { code: 'BF', name: 'Burkina Faso' },
      { code: 'CV', name: 'Cape Verde' },
      { code: 'CI', name: 'Côte d\'Ivoire' },
      { code: 'GM', name: 'Gambia' },
      { code: 'GH', name: 'Ghana' },
      { code: 'GN', name: 'Guinea' },
      { code: 'GW', name: 'Guinea-Bissau' },
      { code: 'LR', name: 'Liberia' },
      { code: 'ML', name: 'Mali' },
      { code: 'NE', name: 'Niger' },
      { code: 'NG', name: 'Nigeria' },
      { code: 'SN', name: 'Senegal' },
      { code: 'SL', name: 'Sierra Leone' },
      { code: 'TG', name: 'Togo' },
    ]
  },
  'EAC': {
    name: 'East African Community',
    countries: [
      { code: 'BI', name: 'Burundi' },
      { code: 'CD', name: 'DR Congo' },
      { code: 'KE', name: 'Kenya' },
      { code: 'RW', name: 'Rwanda' },
      { code: 'SS', name: 'South Sudan' },
      { code: 'TZ', name: 'Tanzania' },
      { code: 'UG', name: 'Uganda' },
    ]
  },
  'IGAD': {
    name: 'Intergovernmental Authority on Development',
    countries: [
      { code: 'DJ', name: 'Djibouti' },
      { code: 'ER', name: 'Eritrea' },
      { code: 'ET', name: 'Ethiopia' },
      { code: 'KE', name: 'Kenya' },
      { code: 'SO', name: 'Somalia' },
      { code: 'SS', name: 'South Sudan' },
      { code: 'SD', name: 'Sudan' },
      { code: 'UG', name: 'Uganda' },
    ]
  },
  'AMU': {
    name: 'Arab Maghreb Union',
    countries: [
      { code: 'DZ', name: 'Algeria' },
      { code: 'LY', name: 'Libya' },
      { code: 'MR', name: 'Mauritania' },
      { code: 'MA', name: 'Morocco' },
      { code: 'TN', name: 'Tunisia' },
    ]
  },
  'ECCAS': {
    name: 'Economic Community of Central African States',
    countries: [
      { code: 'AO', name: 'Angola' },
      { code: 'BI', name: 'Burundi' },
      { code: 'CM', name: 'Cameroon' },
      { code: 'CF', name: 'Central African Republic' },
      { code: 'TD', name: 'Chad' },
      { code: 'CD', name: 'DR Congo' },
      { code: 'CG', name: 'Republic of Congo' },
      { code: 'GQ', name: 'Equatorial Guinea' },
      { code: 'GA', name: 'Gabon' },
      { code: 'RW', name: 'Rwanda' },
      { code: 'ST', name: 'São Tomé and Príncipe' },
    ]
  },
};

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const CountrySelector = ({ value, onValueChange, className }: CountrySelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <SelectValue placeholder="Select Country" />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {Object.entries(REGIONAL_BLOCKS).map(([blockCode, block]) => (
          <SelectGroup key={blockCode}>
            <SelectLabel className="flex items-center gap-2 text-primary font-semibold">
              <Globe className="w-3 h-3" />
              {block.name} ({blockCode})
            </SelectLabel>
            {block.countries.map((country) => (
              <SelectItem key={`${blockCode}-${country.code}`} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;

// Helper to get country name from code
export const getCountryName = (code: string): string => {
  if (code === 'ALL') return 'All Countries';
  for (const block of Object.values(REGIONAL_BLOCKS)) {
    const country = block.countries.find(c => c.code === code);
    if (country) return country.name;
  }
  return code;
};
