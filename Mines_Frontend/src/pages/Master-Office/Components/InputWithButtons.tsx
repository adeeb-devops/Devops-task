import React from "react";
import DateCustom from "./DateCustom";
import MultipleSelect from "./MultipleSelect";

export interface FieldOption {
  value: string | number;
  label: string | number;
}

export interface Field {
  type:
    | "text"
    | "dropdown"
    | "file"
    | "date"
    | "tel"
    | "number"
    | "textarea"
    | "multiselect";
  name: string;
  label: string;
  placeholder?: string;
  value?: string | number;
  multiSelectedValues?: string[];
  onChange?: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onMultiSelectChange?: (selected: string[]) => void;
  options?: FieldOption[];
  multiOptions?: string[];
  dateRange?: [string, string];
  handleDateChange?: (range: [string, string]) => void;
  onFileChange?: (file: File) => void;
  accept?: string;
  rows?: number;
  maxLength?: number;
  aligned?: boolean;
  required?: boolean;
  disabled?:boolean;
}

interface Button {
  text: string;
  onClick: () => void;
  className: string;
  disabled?: boolean;
}

interface InputWithButtonsProps {
  fields: Field[];
  buttons: Button[];
  gridClass?: string;
  inputClass?: string;
  disabledVal?: boolean;
}

const InputWithButtons: React.FC<InputWithButtonsProps> = ({
  fields,
  buttons,
  gridClass,
  disabledVal,
}) => {
  const appliedGridClass = gridClass ? gridClass : "grid-cols-4";
  const disabled = disabledVal ? disabledVal : false;

  const inputFieldClass =
    "w-full h-9 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150 ease-in-out";

  const labelClass = "block mb-2 text-lg font-medium text-gray-800";
  const StarClass = "text-red-500 ml-1";

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: Field
  ) => {
    const file = e.target.files?.[0];
    if (file && field.onFileChange) {
      field.onFileChange(file);
    }
  };

  const renderField = (field: Field, index: number) => {
    const RedStar = (
      <>
        {field.label}
        {field.required && <span className={StarClass}>*</span>}
      </>
    );

    const handleNumberInputChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { value } = e.target;
      if (field.maxLength && value.length > field.maxLength) {
        e.target.value = value.slice(0, field.maxLength);
      }
      if (field.onChange) {
        field.onChange(e);
      }
    };

    switch (field.type) {
      case "text":
      case "tel":
      case "number":
        return (
          <div key={index}>
            <label htmlFor={field.name} className={labelClass}>
              {RedStar}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || "Enter"}
              value={field.value}
              onChange={
                field.type === "number"
                  ? handleNumberInputChange
                  : field.onChange
              }
              disabled={field.disabled || disabled}
              className={inputFieldClass}
              required={field.required}
            />
          </div>
        );
      case "textarea":
        return (
          <div key={index}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
              disabled={field.disabled || disabled}
              rows={field.rows}
              className={`${inputFieldClass}`}
            />
          </div>
        );
      case "dropdown":
        return (
          <div key={index}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <select
              id={field.name}
              name={field.name}
              value={field.value as string}
              onChange={field.onChange}
              className={`${inputFieldClass}`}
            >
              {field.options?.map((option, optionIndex) => (
                <option key={optionIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "file":
        return (
          <div key={index}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <input
              type="file"
              id={field.name}
              name={field.name}
              onChange={(e) => handleFileChange(e, field)}
              accept={field.accept}
              className={`${inputFieldClass} text-[14px]`}
            />
          </div>
        );
      case "date":
        return (
          <div key={index}>
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <DateCustom
              className={inputFieldClass}
              dateRange={[
                field.dateRange?.[0] ? new Date(field.dateRange[0]) : null,
                field.dateRange?.[1] ? new Date(field.dateRange[1]) : null,
              ]}
              handleDateChange={(range: [string, string]) => {
                if (field.handleDateChange) {
                  field.handleDateChange(range);
                }
              }}
              aligned={field.aligned}
            />
          </div>
        );
      case "multiselect":
        return (
          <div key={index} className="" >
            <label htmlFor={field.name} className={labelClass}>
              {field.label}
            </label>
            <MultipleSelect
              // label={field.label}
              className={`${inputFieldClass}`}
              options={field.multiOptions}
              selectedValues={field.multiSelectedValues}
              onChange={field.onMultiSelectChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-6">
      <div className={` grid grid-cols-1 md:${appliedGridClass} mb-6 gap-4`}>
        {fields.map((field, index) => renderField(field, index))}
      </div>
      <div className="flex justify-start gap-5">
        {buttons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.onClick}
            className={`${button.className} flex items-center`}
            disabled={button.disabled}
          >
            {!button.disabled ? (
              button.text
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-transparent border-white mx-4" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputWithButtons;
