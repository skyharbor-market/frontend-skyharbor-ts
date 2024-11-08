import React, { useState, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  label: ReactNode;
}

const Tooltip = ({ children, label }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-10 px-3 min-w-[120px] text-center py-2 text-xs font-normal text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700"
          style={{
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "0.5rem",
          }}
        >
          {label}
          <div
            className="tooltip-arrow"
            style={{
              position: "absolute",
              top: "-0.25rem",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "0.5rem",
              height: "0.5rem",
              backgroundColor: "inherit",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
