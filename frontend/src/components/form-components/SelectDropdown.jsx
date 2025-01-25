
import PropTypes from 'prop-types';

const SelectDropdown = ({ label, options, register, onChange, error }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select {...register} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        <option value="">-- Select an Option --</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );

SelectDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  register: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  error: PropTypes.object,
};
  
export default SelectDropdown;
  