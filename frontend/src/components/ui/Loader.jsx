// frontend/src/components/ui/Loader.jsx
import { ClipLoader } from "react-spinners";

const Loader = ({
  size = 35,
  color = "#4A90E2",
  fullScreen = false,
  className = "",
}) => {
  const loader = (
    <div
      className={`flex justify-center items-center w-full h-full ${className}`}
    >
      <ClipLoader size={size} color={color} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/70 flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
