import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FieldConfig {
  id?: string;
  name?: string;
  label: string;
  type: string;
  value: string | number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
}

interface ButtonConfig {
  name: string;
  onClick: (arg?: any) => void | Promise<void>;
  className?: string;
}

interface PopupsWithInputProps {
  onClose: () => void;
  fields?: FieldConfig[];
  dialogTitle?: string;
  buttons?: ButtonConfig[];
  disabled?: boolean;
}

const PopupsWithInput: React.FC<PopupsWithInputProps> = ({
  onClose,
  fields = [],
  dialogTitle,
  buttons = [],
  disabled = false,
}) => {
  const handleButtonClick = (onClick: ButtonConfig["onClick"]) => async () => {
    await onClick();
    onClose();
  };

  return (
    <Dialog onClose={onClose} open>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "black",
        }}
        className="bg-gray-200"
      >
        {dialogTitle}
        <IconButton edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between mt-4"
          >
            <div className="w-[200px] text-lg">{field.label}</div>
            {field.type === "dropdown" ? (
              <select
                id={field.id}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                className="pl-1 outline-none h-10 w-72 bg-neutral-100 border focus:ring-2 focus:ring-blue-700 rounded-md"
              >
                {field.options?.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.id}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                className="pl-1 outline-none h-20 w-72 bg-neutral-100 border focus:ring-2 focus:ring-blue-700 rounded-md"
              />
            ) : (
              <input
                type={field.type}
                id={field.id}
                name={field.name}
                value={field.value}
                onChange={(e) => {
                  if (field.type === "number" && field.maxLength) {
                    // Ensure only allowed number of digits
                    const newValue = e.target.value.slice(0, field.maxLength);
                    field.onChange?.({
                      ...e,
                      target: { ...e.target, value: newValue },
                    });
                  } else {
                    field.onChange?.(e);
                  }
                }}
                onInput={(e) => {
                  if (field.type === "number" && field.maxLength) {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > field.maxLength) {
                      target.value = target.value.slice(0, field.maxLength);
                    }
                  }
                }}
                disabled={disabled}
                className="pl-1 outline-none h-10 w-72 bg-neutral-100 border focus:ring-2 focus:ring-blue-700 rounded-md"
              />
            )}
          </div>
        ))}
      </DialogContent>
      {buttons.length > 0 && (
        <DialogActions className="mb-1">
          {buttons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={handleButtonClick(button.onClick)}
              className={`${button.className || ""}`}
            >
              {button.name}
            </button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PopupsWithInput;
