import { Square, PieceSymbol, Color, Chess } from "chess.js";
import { useRef } from "react";
import React from "react";
import { squareMapping } from "../utils/squareMapping";
import { ColorEnum } from "../types/gameTypes";

interface Board {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

interface chessBoardProp {
  chessObj: Chess;
  board: (Board | null)[][];
  legalMoves?: number[][];
  onClickSquare?: (row: number, col: number) => void;
  selectedSquare?: number[] | null;
  dragHandler?: (row1: number, col1: number, row2: number, col: number) => void;
}

const ChessBoard = ({
  chessObj,
  board,
  legalMoves = [],
  onClickSquare = () => {},
  selectedSquare = [],
  dragHandler = () => {},
}: chessBoardProp) => {
  const dragFrom = useRef<number[] | null>(null);

  const handleDragStart = (row: number, col: number) => {
    dragFrom.current = [row, col];
  };

  const handleDrop = (row: number, col: number) => {
    if (dragFrom.current) {
      dragHandler(dragFrom.current[0], dragFrom.current[1], row, col);
      dragFrom.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="w-[100%] ">
        <div>
          {board &&
            board.map((row, rowIndex) => {
              return (
                <div key={rowIndex} className="flex">
                  {row.map((square, colIndex) => {
                    //const isSelected = selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                    const isLegalMove = legalMoves.some(
                      ([r, c]) =>
                        Number(r) === rowIndex && Number(c) === colIndex
                    );
                    let doesPieceExist = false;
                    if (isLegalMove) {
                      doesPieceExist = chessObj?.get(
                        squareMapping(
                          rowIndex,
                          colIndex,
                          board[0][0]?.color == "w"
                            ? ColorEnum.BLACK
                            : ColorEnum.WHITE
                        )
                      )
                        ? true
                        : false;
                    }

                    return (
                      <div
                        onDrop={() => handleDrop(rowIndex, colIndex)}
                        onDragOver={handleDragOver}
                        onClick={() => onClickSquare(rowIndex, colIndex)}
                        key={colIndex}
                        className={`flex 
                                        ${
                                          isLegalMove
                                            ? doesPieceExist
                                              ? "bg-red-400"
                                              : "bg-blue-400 border-black border-1"
                                            : (rowIndex + colIndex) % 2 === 0
                                            ? "bg-yellow-100"
                                            : "bg-green-800"
                                        }  
                                        justify-center items-center w-9 h-9 sm:w-14 sm:h-14 lg:w-17 lg:h-17
                                        `}
                      >
                        <div
                          className={`select-none ${
                            selectedSquare &&
                            selectedSquare[0] === rowIndex &&
                            selectedSquare[1] === colIndex
                              ? "bg-purple-300"
                              : ""
                          } `}
                        >
                          {" "}
                          {square?.type ? (
                            <img
                              className="cursor-grab active:cursor-grabbing select-none"
                              draggable={true}
                              onDragStart={() =>
                                handleDragStart(rowIndex, colIndex)
                              }
                              src={`/assets/${square.color + square.type}.png`}
                              alt=""
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default ChessBoard;
