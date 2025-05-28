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

export enum gameResultEnum {
    WIN ='WIN',
    DRAW='DRAW'
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
    type?:string;
}


export interface playersDetailsType{
    myPlayerName: string;
    myColor?:ColorEnum;
    myPlayerId?: string;
    myPlayerPhotoURL?: string;
    
    opponentPlayerName: string;
    opponentColor?:ColorEnum;
    opponentPlayerId?: string;
    opponentPlayerPhotoURL?: string;
    
    myRole?:PlayerRolesEnum;
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


export enum STATUS {
    LOADING= 'loading',
    SUCCESS= 'success',
    NOT_FOUND= 'not_found',
    ERROR= 'error',
};


export enum GameModeEnum{
    ONLINE = 'ONLINE',
    INVITE = 'INVITE'
}

export enum ResponseStatus{
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}


export enum gameResultReasonEnum {
    CHECKMATE = 'CHECKMATE',
    RESIGNATION = 'RESIGNATION',
    TIMEOUT = 'TIMEOUT',
    ABANDONED = 'ABANDONED',
    STALEMATE = 'STALEMATE',
    THREE_FOLD_REPETITION = 'THREE_FOLD_REPETITION',
    DRAW = 'DRAW',
    DRAW_AGREEMENT = 'DRAW_AGREEMENT',
    DRAW_INSUFFICIENT_MATERIAL = 'DRAW_INSUFFICIENT_MATERIAL',
    DRAW_REPETITION = 'DRAW_REPETITION',
    DRAW_50_MOVE_RULE = 'DRAW_50_MOVE_RULE',
}



export interface resultInfoType{
    gameResult:gameResultEnum;
    winner:string;
    gameResultReason:string
}



