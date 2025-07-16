import TextField from "@mui/material/TextField";
import React from "react";

interface Prop {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  error?: boolean;
}

const Input = ({ type, value, onChange, placeholder, label, disabled = false, error = false }: Prop) => {
  return (
    <div className="m-2">
      <TextField
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "#191919",
          },
          "& .MuiInputBase-input": {
            color: "white !important", // <-- force that white text
            WebkitTextFillColor: "white !important", // <-- required for Chrome autofill & disabled
          },
          "& .MuiInputBase-input.Mui-disabled": {
            color: "white !important",
            WebkitTextFillColor: "white !important",
            opacity: 1, // <-- important: override MUI's disabled dimming
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            color: "white !important",
          },
        }}
        disabled={disabled}
        error={error}
        helperText={error ? "Incorrect entry." : ""}
        fullWidth
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        label={label}
        color="primary"
        focused
      />
    </div>
  );
};

export default Input;
