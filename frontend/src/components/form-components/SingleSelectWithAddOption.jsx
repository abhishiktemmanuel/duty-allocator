import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const SingleSelectWithAddOption = ({
  label,
  options: initialOptions = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = "Select or create an option...",
  defaultValue = null,
  error,
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleCreateOption = async (inputValue) => {
    if (onOptionCreate) {
      const createdOption = await onOptionCreate({ label: inputValue });
      setOptions((prev) => [...prev, createdOption]);
      setSelectedOption(createdOption);
    }
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    if (onSelectionChange) onSelectionChange(option);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="w-full max-w-md mx-auto">
        <CreatableSelect
          options={options}
          value={selectedOption}
          onChange={handleChange}
          onCreateOption={handleCreateOption}
          placeholder={placeholder}
          className="text-gray-800 text-left indent-2 "
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "20rem",
              borderColor: "#d1d5db",
              boxShadow: "none",
              "&:hover": { borderColor: "#3b82f6" },
            }),
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

SingleSelectWithAddOption.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.object,
  error: PropTypes.object,
};

export default SingleSelectWithAddOption;
