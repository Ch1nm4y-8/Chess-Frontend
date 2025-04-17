import { PieceSymbol, Square,Color } from "chess.js";

export enum ColorEnum {
    BLACK = "BLACK",
    WHITE = "WHITE"
}

export enum GameStatus {
    IN_PROGRESS = "IN_PROGRESS",
    GAME_COMPLETED = "GAME_COMPLETED",
    DRAW = "DRAW"
}

export enum PlayerRolesEnum{
    PLAYER = "PLAYER",
    SPECTATOR = "SPECTATOR",
}


export type BoardSquare = {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null;

export interface MessagesType{
    userName:string;
    message:string;
}


export interface playersDetailsType{
    myPlayerName: string;
    opponentPlayerName: string;
    myColor?:ColorEnum
    opponentColor?:ColorEnum;
}

export enum GameTypesEnum {
    '1|0' = '1|0',
    '1|1' = '1|1',
    '2|1' = '2|1',
    '3|0' = '3|0',
    '3|2' = '3|2',
    '5|0' = '5|0',
    '10|0' = '10|0',
    '15|10' = '15|10',
    '30|0' = '30|0',
    '60|0' = '60|0',
}


