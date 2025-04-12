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

