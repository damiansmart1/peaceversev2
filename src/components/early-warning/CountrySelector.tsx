import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Globe } from 'lucide-react';

// African Regional Economic Communities with member countries
// Using full country names as values for direct database filtering
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
      { code: 'Burundi', name: 'Burundi' },
      { code: 'Comoros', name: 'Comoros' },
      { code: 'Democratic Republic of Congo', name: 'DR Congo' },
      { code: 'Djibouti', name: 'Djibouti' },
      { code: 'Egypt', name: 'Egypt' },
      { code: 'Eritrea', name: 'Eritrea' },
      { code: 'Eswatini', name: 'Eswatini' },
      { code: 'Ethiopia', name: 'Ethiopia' },
      { code: 'Kenya', name: 'Kenya' },
      { code: 'Libya', name: 'Libya' },
      { code: 'Madagascar', name: 'Madagascar' },
      { code: 'Malawi', name: 'Malawi' },
      { code: 'Mauritius', name: 'Mauritius' },
      { code: 'Rwanda', name: 'Rwanda' },
      { code: 'Seychelles', name: 'Seychelles' },
      { code: 'Sudan', name: 'Sudan' },
      { code: 'Tunisia', name: 'Tunisia' },
      { code: 'Uganda', name: 'Uganda' },
      { code: 'Zambia', name: 'Zambia' },
      { code: 'Zimbabwe', name: 'Zimbabwe' },
    ]
  },
  'SADC': {
    name: 'Southern African Development Community',
    countries: [
      { code: 'Angola', name: 'Angola' },
      { code: 'Botswana', name: 'Botswana' },
      { code: 'Democratic Republic of Congo', name: 'DR Congo' },
      { code: 'Eswatini', name: 'Eswatini' },
      { code: 'Lesotho', name: 'Lesotho' },
      { code: 'Madagascar', name: 'Madagascar' },
      { code: 'Malawi', name: 'Malawi' },
      { code: 'Mauritius', name: 'Mauritius' },
      { code: 'Mozambique', name: 'Mozambique' },
      { code: 'Namibia', name: 'Namibia' },
      { code: 'Seychelles', name: 'Seychelles' },
      { code: 'South Africa', name: 'South Africa' },
      { code: 'Tanzania', name: 'Tanzania' },
      { code: 'Zambia', name: 'Zambia' },
      { code: 'Zimbabwe', name: 'Zimbabwe' },
    ]
  },
  'ECOWAS': {
    name: 'Economic Community of West African States',
    countries: [
      { code: 'Benin', name: 'Benin' },
      { code: 'Burkina Faso', name: 'Burkina Faso' },
      { code: 'Cape Verde', name: 'Cape Verde' },
      { code: 'Côte d\'Ivoire', name: 'Côte d\'Ivoire' },
      { code: 'Gambia', name: 'Gambia' },
      { code: 'Ghana', name: 'Ghana' },
      { code: 'Guinea', name: 'Guinea' },
      { code: 'Guinea-Bissau', name: 'Guinea-Bissau' },
      { code: 'Liberia', name: 'Liberia' },
      { code: 'Mali', name: 'Mali' },
      { code: 'Niger', name: 'Niger' },
      { code: 'Nigeria', name: 'Nigeria' },
      { code: 'Senegal', name: 'Senegal' },
      { code: 'Sierra Leone', name: 'Sierra Leone' },
      { code: 'Togo', name: 'Togo' },
    ]
  },
  'EAC': {
    name: 'East African Community',
    countries: [
      { code: 'Burundi', name: 'Burundi' },
      { code: 'Democratic Republic of Congo', name: 'DR Congo' },
      { code: 'Kenya', name: 'Kenya' },
      { code: 'Rwanda', name: 'Rwanda' },
      { code: 'South Sudan', name: 'South Sudan' },
      { code: 'Tanzania', name: 'Tanzania' },
      { code: 'Uganda', name: 'Uganda' },
    ]
  },
  'IGAD': {
    name: 'Intergovernmental Authority on Development',
    countries: [
      { code: 'Djibouti', name: 'Djibouti' },
      { code: 'Eritrea', name: 'Eritrea' },
      { code: 'Ethiopia', name: 'Ethiopia' },
      { code: 'Kenya', name: 'Kenya' },
      { code: 'Somalia', name: 'Somalia' },
      { code: 'South Sudan', name: 'South Sudan' },
      { code: 'Sudan', name: 'Sudan' },
      { code: 'Uganda', name: 'Uganda' },
    ]
  },
  'AMU': {
    name: 'Arab Maghreb Union',
    countries: [
      { code: 'Algeria', name: 'Algeria' },
      { code: 'Libya', name: 'Libya' },
      { code: 'Mauritania', name: 'Mauritania' },
      { code: 'Morocco', name: 'Morocco' },
      { code: 'Tunisia', name: 'Tunisia' },
    ]
  },
  'ECCAS': {
    name: 'Economic Community of Central African States',
    countries: [
      { code: 'Angola', name: 'Angola' },
      { code: 'Burundi', name: 'Burundi' },
      { code: 'Cameroon', name: 'Cameroon' },
      { code: 'Central African Republic', name: 'Central African Republic' },
      { code: 'Chad', name: 'Chad' },
      { code: 'Democratic Republic of Congo', name: 'DR Congo' },
      { code: 'Republic of Congo', name: 'Republic of Congo' },
      { code: 'Equatorial Guinea', name: 'Equatorial Guinea' },
      { code: 'Gabon', name: 'Gabon' },
      { code: 'Rwanda', name: 'Rwanda' },
      { code: 'São Tomé and Príncipe', name: 'São Tomé and Príncipe' },
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

// Helper to get country name from code (for display purposes)
export const getCountryName = (code: string): string => {
  if (code === 'ALL') return 'All Countries';
  for (const block of Object.values(REGIONAL_BLOCKS)) {
    const country = block.countries.find(c => c.code === code);
    if (country) return country.name;
  }
  return code;
};
