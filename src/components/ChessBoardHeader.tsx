import React from 'react'
import Timer from './Timer';

interface ChessBoardHeaderProp{
    name:string;
    time:string;
    imageURL:string;
}

const defaultImage = 'https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif'

const ChessBoardHeader = React.memo(function ChessBoardHeader({name,time,imageURL}:ChessBoardHeaderProp){
  return (
    <div className="flex justify-between items-center">
        <div className="flex items-center my-2 gap-4">
            <img src={imageURL && imageURL.trim() !== "" ? imageURL : defaultImage} alt="" width={'50vw'}/>
            <h1 className="text-2xl ">{name.toUpperCase()}</h1>
        </div>
        <Timer time={time}/>
    </div>
  )
})

export default ChessBoardHeader
