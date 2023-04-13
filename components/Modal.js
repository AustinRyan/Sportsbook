import React from "react";

const Modal = ({ show, children, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed z-50 top-0 left-0 w-screen h-screen bg-gray-700 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-96 p-4 rounded-md shadow-lg">
        <button
          className="absolute top-2 right-2 focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
