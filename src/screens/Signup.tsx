import React, { useState } from "react";
import OAuthButton from "../components/OAuthButton";
import Button from "../components/Button";
import { PRIMARY_COLOR } from "../config/constants";
import Input from "../components/Input";
import { OTP_DIGITS_LENGTH, SIGNIN_WITH_GOOGLE, SIGNUP, VERIFY_EMAIL } from "../config";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import OtpComponent from "../components/OtpComponent";
import { toast, ToastContainer } from "react-toastify";
import ChessLoader from "../components/ChessLoader";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<{ message: string }>();
  const [showVerifyEmail, setShowVerifyEmail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>([...Array(OTP_DIGITS_LENGTH).fill("")]);
  const isOtpComplete = otp.every((digit) => digit !== "");

  const signUpHandler = async () => {
    try {
      setLoading(true);
      const result = await axios.post(
        SIGNUP,
        {
          email,
          password,
          userName,
        },
        { withCredentials: true }
      );

      console.log(result.data);
      setShowVerifyEmail(true);
      setError(undefined);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        console.log("ERROR CAUGHT " + JSON.stringify(err.response.data));
        setError(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailHandler = async () => {
    const otpToBeSent = otp.join("");
    if (otpToBeSent.length != OTP_DIGITS_LENGTH) {
      alert("INVALID OTP LENGTH");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        VERIFY_EMAIL,
        {
          email,
          otp: otpToBeSent,
        },
        { withCredentials: true }
      );

      toast("Email Verify Successful", {
        theme: "colored",
        type: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        toast("Invalid OTP", {
          theme: "colored",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleHandler = async () => {
    window.location.href = SIGNIN_WITH_GOOGLE;
  };

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <ChessLoader />
      </div>
    );

  return (
    <div>
      <ToastContainer position="top-center" />

      <div className="h-screen  py-3 bg-center bg-cover flex gap-10 justify-center items-center" style={{ backgroundImage: "url('/assets/auth-bg.avif')" }}>
        <div className="relative xl:w-1/3 w-2/3 mt-10 ">
          <div role="tablist" className="tabs tabs-lift">
            <input
              type="radio"
              name="my_tabs_2"
              role="tab"
              className="tab [--tab-bg:transparent] [--tab-border-color:transparent]"
              aria-label="LOGIN"
              defaultChecked
              onClick={() => navigate("/login")}
            />

            <input type="radio" name="my_tabs_2" role="tab" className="tab tab-active [--tab-bg:#202020] [--tab-border-color:#0BA0E2]" aria-label="SIGN UP" />
            <div role="tabpanel" className="bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a]  border-[#0BA0E2] text-white p-6 cursor-pointer shadow-lg transition-all duration-300 border  tab-content">
              <div className="flex justify-center">
                <div className="card-body p-2">
                  <h2 className="card-title justify-center text-3xl">Sign Up Page</h2>

                  <Input disabled={showVerifyEmail} type="text" value={userName} label="Username" placeholder="Username" onChange={(e) => setUserName(e.target.value)} />
                  <Input disabled={showVerifyEmail} type="email" value={email} label="Email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                  <Input disabled={showVerifyEmail} type="password" value={password} label="Password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                  {error && error?.message && <h1 className="text-red-500 text-sm mt-2">{error.message}</h1>}

                  <div className="flex justify-center">
                    <Button color={PRIMARY_COLOR} onClick={signUpHandler}>
                      Sign Up
                    </Button>
                  </div>
                  <div className="m-auto">
                    <OAuthButton onClick={signInWithGoogleHandler} imagePath="/assets/google.png">
                      Sign In With Google
                    </OAuthButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showVerifyEmail && (
          <div className="relative xl:w-1/3 w-2/3 mt-10 bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a] border  border-[#0BA0E2] text-white p-6 cursor-pointer shadow-lg transition-all duration-300 rounded-xl flex flex-col gap-5">
            <div className="text-center text-3xl">VERIFY OTP</div>
            <OtpComponent otp={otp} setOtp={setOtp} />

            <button
              disabled={!isOtpComplete || loading}
              className={`py-2 flex-1 px-8 rounded-sm cursor-pointer bg- disabled:bg-[#0cb07c18] disabled:cursor-not-allowed bg-[${PRIMARY_COLOR}]`}
              onClick={verifyEmailHandler}
            >
              Verify Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
