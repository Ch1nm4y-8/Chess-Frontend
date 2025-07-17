import { useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";
import axios, { AxiosError } from "axios";
import { LOGOUT } from "../config";
import ChessLoader from "./ChessLoader";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      setLoading(true);
      await axios.get(LOGOUT, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        console.log("ERROR CAUGHT " + JSON.stringify(err.response.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const navbarData = [
    { label: "Home", to: "/" },
    { label: "Play", to: "/game" },
    { label: "History", to: "/history/game" },
  ];

  if (loading)
    return (
      <div className="absolute top-0 left-0 z-10 bg-black w-full h-screen flex justify-center items-center">
        <ChessLoader />
      </div>
    );

  return (
    <>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-6xl bg-[#0f0f0f] border border-[#1f1f1f] text-white px-6 py-3 rounded-xl shadow-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#0BA0E2] overflow-hidden">
            <img
              src={user?.photoURL || "https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif"}
              onError={(e) => {
                e.currentTarget.src = "https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif";
              }}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[#0BA0E2] font-bold">{user?.userName.toUpperCase()}</span>
        </Link>

        <div className="hidden sm:flex gap-8 ml-auto">
          {navbarData.map((item, i) => (
            <Link key={i} to={item.to} className="px-4 py-1 rounded-md text-sm font-semibold hover:bg-[#0BA0E2] hover:text-black transition">
              {item.label}
            </Link>
          ))}
          <button onClick={logoutHandler} className="hover:cursor-pointer px-4 py-1 rounded-md text-sm font-semibold hover:bg-[#0BA0E2] hover:text-black transition">
            Logout
          </button>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="text-white  cursor-pointer text-2xl sm:hidden ml-auto">
          {isOpen ? "X" : "☰"}
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 w-full bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl shadow-lg px-6 py-4 flex flex-col gap-3 lg:hidden">
            {navbarData.map((item, i) => (
              <Link key={i} to={item.to} onClick={() => setIsOpen(false)} className="px-4 py-2 text-center rounded-md hover:bg-[#0BA0E2] hover:text-black transition">
                {item.label}
              </Link>
            ))}
            <button onClick={logoutHandler} className="px-4 py-2 rounded-md hover:bg-[#0BA0E2] hover:text-black transition hover:cursor-pointer">
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
