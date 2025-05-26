import React from 'react'

interface ChessBoardHeaderProp{
    name:string;
    time:string;
    imageURL:string;
}

const defaultImage = 'https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif'

const ChessBoardHeader = ({name,time,imageURL}:ChessBoardHeaderProp) => {
  return (
    <div className="flex justify-between items-center">
        <div className="flex items-center my-2 gap-4">
            <img src={imageURL||defaultImage} alt="" width={'50vw'}/>
            <h1 className="text-2xl ">{name.toUpperCase()}</h1>
        </div>
        <div>
            <div className="bg-white text-black text-3xl m-2 ">{time}</div>     
        </div>
    </div>
  )
}

export default ChessBoardHeader
