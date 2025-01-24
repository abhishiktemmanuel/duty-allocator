import PropTypes from 'prop-types';

const InputField = ({ label, type, register, error, ...props }) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        {...register}
        {...props}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  register: PropTypes.object,
  error: PropTypes.object,
};
  
export default InputField;
  