// frontend/src/components/ui/Input.jsx

const Input = ({ name, type = "text", className = "", ...rest }) => (
  <input
    name={name}
    type={type}
    className={`w-full px-[1rem] py-[0.5rem] border rounded focus:outline-none focus:ring-2 focus:ring-black ${className}`}
    {...rest}
  />
);

export default Input;
