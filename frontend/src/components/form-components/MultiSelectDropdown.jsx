import Multiselect from "multiselect-react-dropdown";
import PropTypes from 'prop-types';

const MultiSelectDropdown = ({ label, options, placeholder, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <Multiselect options={options} displayValue="name" onSelect={onChange} onRemove={onChange} placeholder={placeholder} />
    {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
  </div>
);

MultiSelectDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.object
};

export default MultiSelectDropdown;
