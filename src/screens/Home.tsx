import { useNavigate } from "react-router-dom";
import React from "react";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="overflow-hidden relative bg-gradient-to-t from-black via-[#0e0e0e] to-[#171717] h-[100vh] flex flex-col gap-10 justify-center">
        <div className='w-[50vw] h-[100vh] bg-[url("/assets/chessboard.png")] bg-cover absolute right-[-20vw] top-0 '></div>
        <button className="bg-[#0CB07B] py-4 px-8 cursor-pointer" onClick={() => navigate("/game/")}>
          Play Now
        </button>
        <button className="bg-[#0BA0E2] py-4 px-8 cursor-pointer" onClick={() => navigate("/history/game")}>
          View History
        </button>
      </div>
    </>
  );
};

export default Home;
