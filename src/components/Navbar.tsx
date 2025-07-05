import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/userContext";

const Navbar = () => {
  const { user } = useUser();
  console.log(user);

  return (
    <nav className="hidden lg:flex bg-[#565757] text-black bg-opacity-50 backdrop-blur-3xl absolute top-0 left-1/2 transform -translate-x-1/2 z-10 justify-between items-center w-[50vw] px-7 py-3 mt-2 rounded-4xl text-xl">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-[2vw]">
          <img
            className="rounded-full w-full h-full"
            src={user?.photoURL}
            onError={(e) => {
              e.currentTarget.src = "https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif";
            }}
            alt=""
          />
        </div>
        <h1>{user?.userName.toUpperCase()}</h1>
      </Link>

      <div className="flex items-center justify-center gap-10">
        <Link to="/">Home</Link>
        <Link to="/game">Play</Link>
        <Link to="/history/game">History</Link>
      </div>
    </nav>
  );
};

export default Navbar;
