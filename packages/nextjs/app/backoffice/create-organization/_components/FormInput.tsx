const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="form-control">
    <label className="label text-lg">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="input input-bordered border-gray-300 rounded-lg focus:outline-primary"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default FormInput;
