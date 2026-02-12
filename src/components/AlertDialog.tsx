import React from "react";
import { Toaster } from "react-hot-toast";

const AlertDialog: React.FC = () => {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      toastOptions={{
        // Define default options
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          duration: 3000,
        },
      }}
    />
  );
};

export default AlertDialog;
