import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

interface ConfirmationPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onSubmit: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // backgroundColor: "#F3F4F6",
          color: "black",
        }}
        className="bg-gray-200"
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <p className="mt-4">{message}</p>
      </DialogContent>
      <DialogActions>
        <button
          onClick={onClose}
          className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-2 py-2 bg-blue-500 text-white rounded-md"
        >
          Confirm
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationPopup;
