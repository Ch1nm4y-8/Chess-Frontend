import React from "react";

interface ButtonProp {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  style?: React.CSSProperties;
}

const Button = ({ children, onClick, color, style }: ButtonProp) => {
  return (
    <div className="flex">
      <button style={{ backgroundColor: color, ...style }} className={`py-2 flex-1 px-8 rounded-sm cursor-pointer`} onClick={onClick}>
        {children}
      </button>
    </div>
  );
};

export default Button;
