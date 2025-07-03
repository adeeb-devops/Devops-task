import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 2;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       // width: 250,
//     },
//   },
// };

interface MultipleSelectProps {
  label?: string;
  className: string;
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

const MultipleSelect: React.FC<MultipleSelectProps> = ({
  label,
  options,
  className,
  selectedValues,
  onChange,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    // Ensure the selected values are always in an array format
    const updatedValues = typeof value === "string" ? value.split(",") : value;
    onChange(updatedValues);
  };

  return (
    <FormControl sx={{ width: 300 }} size="small">
      {/* <InputLabel id={`${label}-label`}>{label}</InputLabel> */}
      <Select
        labelId={`${label}-label`}
        id={`${label}-select`}
        multiple
        value={selectedValues}
        className={`${className}`}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) =>
          selected.length ? selected.join(", ") : "Select an option"
        }
        // MenuProps={MenuProps}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultipleSelect;
