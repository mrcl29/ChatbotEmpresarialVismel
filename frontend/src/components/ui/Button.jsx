// frontend/src/components/ui/Button.jsx

const Button = ({
  children, // recibe lo que haya entre etiquetas <Button>...</Button>
  className = "",
  onClick = () => {},
  ...rest
}) => {
  return (
    <button
      type="submit"
      className={`w-full bg-black text-white p-[0.5rem] rounded-2xl hover:bg-gray-900 cursor-pointer font-semibold transition-all ease-in duration-200 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children} {/* Aquí se muestra el contenido */}
    </button>
  );
};

export default Button;
