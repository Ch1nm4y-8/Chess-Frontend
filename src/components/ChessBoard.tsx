import { Square,PieceSymbol, Color } from "chess.js";
import { useRef } from "react";
import React from "react";

interface playersDetails{
    myPlayerName: string;
    opponentPlayerName: string;
}
interface Board {
    square: Square;
    type: PieceSymbol;
    color: Color;
}

interface chessBoardProp{
    board:(Board|null)[][];
    legalMoves?: string[];
    onClickSquare?:(row:number,col:number)=>void;
    selectedSquare?:number[];
    playersDetails:playersDetails;
    dragHandler?:(row1:number,col1:number,row2:number,col:number)=>void;
}

const ChessBoard = ({board , legalMoves=[], onClickSquare=(()=>{}), selectedSquare=[],playersDetails,dragHandler=(()=>{})}:chessBoardProp) => {
    const dragFrom = useRef<number[] |null>(null);

    const handleDragStart = (row:number,col:number)=>{
        console.log('started from '+row+' '+col)
        dragFrom.current = [row,col]

    }

    const handleDrop = (row:number, col:number)=>{
        if (dragFrom.current) {
            console.log('dropped in '+row+' '+col)
            dragHandler(dragFrom.current[0],dragFrom.current[1],row,col)
            dragFrom.current = null;
          }
    }

    const handleDragOver = (e:React.DragEvent)=>{
        e.preventDefault();
    }



  return (
    <>
    <div>
        <div className="flex items-center my-2 gap-4">
            <img src="https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif" alt="" width={'50vw'}/>
            <h1 className="text-2xl ">{playersDetails?.opponentPlayerName?playersDetails?.opponentPlayerName:'Opponent'}</h1>
        </div>
      <div>
            {
                board && board.map((row,rowIndex)=>{
                    return (
                        
                        <div key={rowIndex} className="flex">
                            {row.map((square,colIndex)=>{
                                //const isSelected = selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                                const isLegalMove = legalMoves.some(([r, c]) => Number(r) === rowIndex && Number(c) === colIndex);
                                //console.log(isLegalMove)
                                return (
                                    <div 
                                    onDrop={() => handleDrop(rowIndex, colIndex)}
                                    onDragOver={handleDragOver}
                                    onClick={()=>onClickSquare(rowIndex,colIndex)} key={colIndex} className={`flex 
                                        ${isLegalMove ? 'bg-blue-800 border-black border-2':((rowIndex + colIndex) % 2 === 0) ? 'bg-yellow-100' : 'bg-green-800'}  justify-center items-center w-17 h-17
                                                                            
                                        ${isLegalMove && 'bg-blue-800'}
                                        `}>
                                    
                                    <div className=
                                            {`select-none ${selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex ? "bg-red-500" : ""} `}>                                            {
                                                square?.type? <img 
                                                                className="cursor-grab active:cursor-grabbing select-none" 
                                                                draggable={true} 
                                                                onDragStart={() => handleDragStart(rowIndex, colIndex)}
                                                                src={`/assets/${square.color+square.type}.png`} 
                                                                alt="" />:''
                                            }  
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                    )
                })
            }
            </div>

            <div className="flex items-center my-2 gap-4">
                <img src="https://www.chess.com/bundles/web/images/noavatar_l.84a92436@2x.gif" alt="" width={'50vw'}/>
                <h1 className="text-2xl">{playersDetails?.myPlayerName?playersDetails?.myPlayerName:'Me'}</h1>
            </div>
    </div>
    </>
  )
}

export default ChessBoard
