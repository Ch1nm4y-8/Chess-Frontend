import React from "react";
import Timer from "./Timer";

interface ChessBoardHeaderProp {
  name: string;
  time: string;
  imageURL: string;
  warningTime?: string | null;
}

const defaultImage = "/assets/defaultProfileImage.gif";

const ChessBoardHeader = React.memo(function ChessBoardHeader({ name, time, imageURL, warningTime }: ChessBoardHeaderProp) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center my-2 gap-4">
        <img src={imageURL && imageURL.trim() !== "" ? imageURL : defaultImage} alt="" width={"50vw"} />
        <div>
          <h1 className="text-2xl ">{name.toUpperCase()}</h1>
          {warningTime && <div className="bg-red-100 border text-sm px-2 border-red-500 text-red-500">Auto Aborts in : {warningTime}</div>}
        </div>
      </div>
      <Timer time={time} />
    </div>
  );
});

export default ChessBoardHeader;
