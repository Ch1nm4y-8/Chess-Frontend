import React from 'react'

interface ChessBoardHeaderProp{
    name:string;
    time:string;
}

const ChessBoardHeader = ({name,time}:ChessBoardHeaderProp) => {
  return (
    <div className="flex justify-between items-center">
        <div className="flex items-center my-2 gap-4">
            <img src="https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif" alt="" width={'50vw'}/>
            <h1 className="text-2xl ">{name}</h1>
        </div>
        <div>
            <div className="bg-white text-black text-3xl m-2 ">{time}</div>     
        </div>
    </div>
  )
}

export default ChessBoardHeader
