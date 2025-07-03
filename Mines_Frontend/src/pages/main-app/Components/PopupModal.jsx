import React from "react";

const PopupModal = ({ title, children, onClose }) => {
  return (
    <div className="popup-modal-overlay" onClick={onClose}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <div>
          <header>
            <h2>{title}</h2>
          </header>
          <div className="main modal-container">
            <div className="popup-content">{children}</div>
          </div>
        </div>

        <footer>
          <button className="close-btn" onClick={onClose}>
            CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PopupModal;
