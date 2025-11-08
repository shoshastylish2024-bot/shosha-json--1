import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'number' | 'boolean';
  value: string | number | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, type, value, onChange, placeholder, options, min, max, required }) => {
  const commonInputClasses = "w-full bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition";
  
  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            id={id}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            className={commonInputClasses}
          />
        );
      case 'dropdown':
        return (
          <select id={id} value={value as string} onChange={onChange} className={commonInputClasses}>
            {options?.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            id={id}
            value={value as number}
            onChange={onChange}
            min={min}
            max={max}
            className={commonInputClasses}
          />
        );
      case 'boolean':
        return (
          <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id={id}
              checked={value as boolean}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-400 bg-slate-50 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </label>
        );
      default:
        return null;
    }
  };

  if (type === 'boolean') {
    return <div className="flex items-center pt-2">{renderInput()}</div>;
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};

export default FormField;