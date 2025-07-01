import React from "react";
import { ColorEnum } from "../types/gameTypes";
import { resultInfoType } from "../types/gameTypes";

const ResultModalContent = ({ result }: { result: resultInfoType | null }) => {
  function getImage() {
    if (result?.gameResult == "WIN") {
      console.log(
        `/assets/${
          getWinner() === ColorEnum.BLACK ? "black_won.png" : "white_won.png"
        }`
      );
      return `/assets/${
        getWinner() === ColorEnum.BLACK ? "black_won.png" : "white_won.png"
      }`;
    } else if (result?.gameResult == "DRAW") {
      return "/assets/bp.png";
    }
  }

  function getWinner() {
    return result?.winner?.match(/\b(black|white)\b/i)?.[0].toUpperCase() || "";
  }

  return (
    <div>
      <h3 className="font-bold text-3xl text-center">{`${
        result?.gameResult === "DRAW" ? "DRAW" : getWinner() + " WON"
      }`}</h3>
      {result?.gameResultReason && (
        <p className="py-4 text-center">by {result?.gameResultReason}</p>
      )}
      <div className="w-[40%] m-auto" draggable={false}>
        <img src={getImage()} alt="" />
      </div>
      <div className="modal-action">
        <form method="dialog">
          <button className="btn">Close</button>
        </form>
      </div>
    </div>
  );
};

export default ResultModalContent;
