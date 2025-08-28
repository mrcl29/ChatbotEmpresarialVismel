// frontend/src/utils/handleApiError.js
export const handleApiError = (error, fallbackMessage = "Error inesperado") => {
  let message = fallbackMessage;

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  return {
    success: false,
    message,
  };
};
