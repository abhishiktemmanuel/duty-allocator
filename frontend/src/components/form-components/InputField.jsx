import PropTypes from 'prop-types';

const InputField = ({ label, type, register, error, placeholder, className, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder} // Accept and apply the placeholder
      {...register}
      {...props}
      className={`w-full px-3 py-1.5 bg-white text-gray-900  border border-gray-300 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  transition duration-150 ${className}`} // Merge default and custom classes
    />
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
);

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  register: PropTypes.object,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  className: PropTypes.string, // Added className to PropTypes
};

export default InputField;
