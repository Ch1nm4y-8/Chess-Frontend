import React, { useState } from "react";
import OAuthButton from "../components/OAuthButton";
import { PRIMARY_COLOR } from "../config/constants";
import Input from "../components/Input";
import Button from "../components/Button";
import { LOGIN, SIGNIN_WITH_GOOGLE } from "../config";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ message: string }>();
  const navigate = useNavigate();

  const loginHandler = async () => {
    try {
      const result = await axios.post(
        LOGIN,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      console.log(result.data);
      navigate("/");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        console.log("ERROR CAUGHT " + JSON.stringify(err.response.data));
        setError(err.response.data);
      }
    }
  };

  const signInWithGoogleHandler = async () => {
    window.location.href = SIGNIN_WITH_GOOGLE;
  };

  return (
    <div>
      <div className="min-h-screen  py-3 bg-center bg-cover flex justify-center items-center" style={{ backgroundImage: "url('/assets/auth-bg.avif')" }}>
        <div className="relative xl:w-1/3 w-2/3 mt-10 ">
          <div role="tablist" className="tabs tabs-lift">
            <input type="radio" name="my_tabs_2" role="tab" className="tab [--tab-bg:#1f1f1f] [--tab-border-color:#0BA0E2]" aria-label="LOGIN" defaultChecked />
            <div role="tabpanel" className="bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a] border-[#0BA0E2] text-white p-6  shadow-lg transition-all duration-300 border  tab-content ">
              <div className="flex justify-center">
                <div className="card-body p-2">
                  <h2 className="card-title justify-center text-3xl">Login Page</h2>
                  <Input type="email" value={email} label={"Email"} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                  <Input type="password" value={password} label="Password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                  {error && error?.message && <h1 className="text-red-500 text-sm mt-2">{error.message}</h1>}

                  <div className="m-auto">
                    <Button color={PRIMARY_COLOR} onClick={loginHandler}>
                      Login
                    </Button>
                  </div>
                  <div className="m-auto">
                    <OAuthButton onClick={signInWithGoogleHandler} imagePath="/assets/google.png">
                      Sign In With Google
                    </OAuthButton>
                  </div>
                  <p onClick={() => navigate("/forgot-password")} className={`mt-2 hover:cursor-pointer w-fit hover:text-blue-500`}>
                    Forgot Password?
                  </p>
                </div>
              </div>
            </div>

            <input type="radio" name="my_tabs_2" role="tab" className="tab [--tab-bg:#202020] [--tab-border-color:transparent]" aria-label="SIGN UP" onClick={() => navigate("/signup")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
