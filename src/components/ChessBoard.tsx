import { Square,PieceSymbol, Color } from "chess.js";

interface Board {
    square: Square;
    type: PieceSymbol;
    color: Color;
}

interface chessBoardProp{
    board:(Board|null)[][];
    legalMoves: number[][];
    onClickSquare:(row:number,col:number)=>void;
    selectedSquare:number[];
}

const ChessBoard = ({board , legalMoves, onClickSquare, selectedSquare}:chessBoardProp) => {
  return (
    <div>
      <div>
            {
                board.map((row,rowIndex)=>{
                    return (
                        <div key={rowIndex} className="flex">
                            {row.map((square,colIndex)=>{
                                const isSelected = selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                                const isLegalMove = legalMoves.some(([r, c]) => Number(r) === rowIndex && Number(c) === colIndex);
                                //console.log(isLegalMove)
                                return (
                                    <div onClick={()=>onClickSquare(rowIndex,colIndex)} key={colIndex} className={`flex 
                                        ${isLegalMove ? 'bg-blue-800 border-black border-2':((rowIndex + colIndex) % 2 === 0) ? 'bg-yellow-100' : 'bg-green-800'}  justify-center items-center w-20 h-20 
                                    
                                        
                                    
                                    ${isLegalMove && 'bg-blue-800'}
                                      `}>
                                    
                                    <div className=
                                            {`select-none ${selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex ? "bg-red-500" : ""} `}>                                            {
                                                square?.type? <img className="cursor-grab active:cursor-grabbing" draggable={false} src={`/assets/${square.color+square.type}.png`} alt="" />:''
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
    </div>
  )
}

export default ChessBoard
