import React, { useEffect, useState } from "react";
import { PRIMARY_COLOR } from "../config/constants";
import Input from "../components/Input";
import Button from "../components/Button";
import axios, { AxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FORGOT_PASSWORD, RESET_PASSWORD } from "../config";
import Modal from "../components/Modal";
import ChessLoader from "../components/ChessLoader";

type ModalName = "forgot-password" | "reset-password";

interface ErrorResponse {
  message: string;
}

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  error?: ErrorResponse;
  onSubmit: () => void;
  navigate: (path: string) => void;
}

interface ResetPasswordFormProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  error?: ErrorResponse;
  onSubmit: () => void;
}

interface SuccessModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
}

const useModal = () => {
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);

  const openModal = (modalName: ModalName): void => setActiveModal(modalName);
  const closeModal = (): void => setActiveModal(null);
  const isModalOpen = (modalName: ModalName): boolean => activeModal === modalName;

  return { openModal, closeModal, isModalOpen };
};

const ForgotPassword = () => {
  const { openModal, closeModal, isModalOpen } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<ErrorResponse | undefined>();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [showResetPasswordScreen, setShowResetPasswordScreen] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      setShowResetPasswordScreen(true);
    }
  }, [token]);

  const forgotPasswordHandler = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const result = await axios.post(FORGOT_PASSWORD, { email });
      console.log(result.data);
      openModal("forgot-password");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data as ErrorResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordHandler = async () => {
    if (password !== confirmPassword) {
      setError({ message: "Passwords do not match" });
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);
      await axios.post(RESET_PASSWORD, { token, password });
      openModal("reset-password");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data as ErrorResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (): void => {
    closeModal();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="absolute top-0 left-0 z-10 bg-black w-full h-screen flex justify-center items-center">
        <ChessLoader />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen py-3 bg-center bg-cover flex justify-center items-center" style={{ backgroundImage: "url('/assets/auth-bg.avif')" }}>
        <div className="bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a] border-[#0BA0E2] text-white p-6 shadow-lg transition-all duration-300 border w-[50vmax] md:w-[30vmax]">
          <div className="flex justify-center">
            {!showResetPasswordScreen ? (
              <ForgotPasswordForm email={email} setEmail={setEmail} error={error} onSubmit={forgotPasswordHandler} navigate={navigate} />
            ) : (
              <ResetPasswordForm
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                error={error}
                onSubmit={resetPasswordHandler}
              />
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen("forgot-password")} onClose={closeModal}>
        <SuccessModal title="Password Reset" message="If the email exists, a reset link has been sent to your inbox." onConfirm={handleModalClose} />
      </Modal>

      <Modal isOpen={isModalOpen("reset-password")} onClose={closeModal}>
        <SuccessModal title="Password Reset" message="Password has been successfully reset!" onConfirm={handleModalClose} />
      </Modal>
    </div>
  );
};

const ForgotPasswordForm = ({ email, setEmail, error, onSubmit, navigate }: ForgotPasswordFormProps) => (
  <div className="card-body p-2">
    <h2 className="card-title justify-center text-3xl">Forgot Password?</h2>
    <Input type="email" value={email} label="Email" placeholder="Email" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
    {error && error?.message && <h1 className="text-red-500 text-sm mt-2">{error.message}</h1>}

    <div className="m-auto">
      <Button color={PRIMARY_COLOR} onClick={onSubmit}>
        Forgot Password
      </Button>
    </div>

    <p onClick={() => navigate("/login")} className="mt-2 hover:cursor-pointer w-fit hover:text-blue-500">
      Suddenly Remembered Your Password?
    </p>
  </div>
);

const ResetPasswordForm = ({ password, setPassword, confirmPassword, setConfirmPassword, error, onSubmit }: ResetPasswordFormProps) => (
  <div className="card-body p-2">
    <h2 className="card-title justify-center text-3xl">Reset Password?</h2>
    <Input type="password" value={password} label="Password" placeholder="Password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
    <Input type="password" value={confirmPassword} label="Confirm Password" placeholder="Confirm Password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} />
    {error && error?.message && <h1 className="text-red-500 text-sm mt-2">{error.message}</h1>}

    <div className="m-auto">
      <Button color={PRIMARY_COLOR} onClick={onSubmit}>
        Reset Password
      </Button>
    </div>
  </div>
);

const SuccessModal = ({ title, message, onConfirm }: SuccessModalProps) => (
  <div>
    <h2 className="text-center text-4xl py-3">{title}</h2>
    <h3 className="text-lg pb-4 text-center">{message}</h3>
    <div className="flex justify-around">
      <Button color="#0CB07B" onClick={onConfirm}>
        OK
      </Button>
    </div>
  </div>
);

export default ForgotPassword;
