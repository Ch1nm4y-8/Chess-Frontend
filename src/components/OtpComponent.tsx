import React, { useRef } from "react";
import { OTP_DIGITS_LENGTH } from "../config";

interface OtpComponentType {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
}

const OtpComponent = ({ otp, setOtp }: OtpComponentType) => {
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  }

  function handleChange(value: string, index: number) {
    console.log(value);
    if (!/^\d+$/.test(value) && value !== "") return;
    const newOtp = [...otp];

    if (value.length == OTP_DIGITS_LENGTH) {
      const pastedCode = value.split("");
      setOtp(pastedCode);
      inputRef.current[OTP_DIGITS_LENGTH - 1]?.focus();
    } else {
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value != "") inputRef.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-around">
      {otp.map((digit, i) => (
        <input
          key={i}
          value={digit}
          ref={(ele) => {
            inputRef.current[i] = ele;
          }}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="border text-center text-2xl border-white w-10 h-10 focus:outline-none bg-[#111111] focus:border-[#0BA0E2]"
        />
      ))}
    </div>
  );
};

export default OtpComponent;
