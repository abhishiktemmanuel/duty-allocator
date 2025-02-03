import PropTypes from "prop-types";

const SelectDropdown = ({ options, placeholder, value, onSelectionChange }) => (
  <select
    value={value?.value || ""}
    onChange={(e) => {
      const selectedOption = options.find(opt => opt.value === e.target.value);
      onSelectionChange(selectedOption);
    }}
    className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
  >
    <option value="">{placeholder || "-- Select an Option --"}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

SelectDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  onSelectionChange: PropTypes.func.isRequired,
};

export default SelectDropdown;
