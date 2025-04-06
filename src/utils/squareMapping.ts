import { ColorEnum } from "../types/gameTypes";

export const squareMapping = (row:number,col:number,color:string) => {
  return color==ColorEnum.WHITE?String.fromCharCode(97+col)+(8-row):String.fromCharCode(104-col)+(1+row)
}

export const reverseSquareMapping = (square:string|null, color:string) =>{
  if(!square) return []

  return [
    color === ColorEnum.WHITE ? 8 - parseInt(square[1]) : parseInt(square[1]) - 1,
    color === ColorEnum.WHITE ? square.charCodeAt(0) - 97 : 104 - square.charCodeAt(0)
  ];
}

