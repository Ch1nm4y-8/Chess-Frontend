import React from "react";
import { PRIMARY_COLOR, SECONDARY_COLOR } from "../config/constants";

interface inviteGameIdProp {
  inviteGameIdToSend: string;
}

const InviteGameId = ({ inviteGameIdToSend }: inviteGameIdProp) => {
  return (
    <div
      title="Click to Copy"
      onClick={() => {
        navigator.clipboard.writeText(inviteGameIdToSend);
        alert("game id copied");
      }}
      className={`bg-[#131313] border border-${PRIMARY_COLOR} hover:border-${SECONDARY_COLOR} cursor-pointer m-5 p-5 place-self-center text-sm`}
    >
      <span className="text-3xl text-center ">Invite Code:</span>
      <br />
      {inviteGameIdToSend}
    </div>
  );
};

export default InviteGameId;
