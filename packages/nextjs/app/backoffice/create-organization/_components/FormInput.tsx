import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string; // <-- Add this!
}

const FormInput: React.FC<FormInputProps> = ({ label, type = "text", placeholder, value, onChange, className }) => (
  <div className="form-control">
    <label className="label text-lg">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`input input-bordered border-gray-300 rounded-lg focus:outline-primary ${className || ""}`} // merge classes
    />
  </div>
);

export default FormInput;
