import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChessBoard from '../components/ChessBoard';
import { Chess } from "chess.js";
import { BoardSquare, ColorEnum } from '../types/gameTypes';
import axios from 'axios';
import { GET_GAME_WITH_MOVE_HISTORY } from '../config/endpoints';
import Button from '../components/Button';
import { useUser } from '../contexts/userContext';
import { playersDetailsType } from '../types/gameTypes';


const GameWithMoveHistory = () => {
    const {gameId} = useParams();
    const chessObj = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
    const moves = useRef<{boardStatus:string}[]>([]);
    
    const { user } = useUser();
    const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({opponentPlayerName:'Opponent',myPlayerName:user||'Me'})
    const currentMove = useRef<number>(0)

    useEffect(()=>{
        const fetchGameDataWithMoves = async()=>{
            const response = await axios.get(GET_GAME_WITH_MOVE_HISTORY+gameId,{withCredentials:true});
            moves.current=response.data.movesData

            console.log(response.data)
            const amIPlayer1 = response.data.gameData.player1Id.userName === user;
            const myPlayerName = amIPlayer1 ? response.data.gameData.player1Id.userName : response.data.gameData.player2Id.userName;
            const opponentPlayerName = amIPlayer1 ? response.data.gameData.player2Id.userName : response.data.gameData.player1Id.userName;
            const myColor = amIPlayer1 ? ColorEnum.WHITE : ColorEnum.BLACK;
            const opponentColor = amIPlayer1 ? ColorEnum.BLACK : ColorEnum.WHITE;

            setPlayersDetails({
            myPlayerName,
            opponentPlayerName,
            myColor,
            opponentColor
            });

        }
        fetchGameDataWithMoves();
    },[])

    const ButtonHandler=(type:string)=>{
        console.log('before current Move '+currentMove.current)
        if (type=='prev'){
            if (currentMove.current<=0) return;
            currentMove.current-=1
        }
        else if (type=='next'){
            if (currentMove.current>=moves.current.length-1) return;
            currentMove.current+=1
        }
       
        console.log(`current Move number : ${currentMove.current}    ${JSON.stringify(moves.current[currentMove.current])}`)
        chessObj.current.load(moves.current[currentMove.current].boardStatus)
        setBoard(chessObj.current.board());

    }

  return (
    <div className='flex justify-evenly items-center'>

        <div>
            <ChessBoard board={board} playersDetails={playersDetails}/>
        </div>

        <div>
            <Button onClick={()=>ButtonHandler('prev')}>left</Button>
            <Button onClick={()=>ButtonHandler('next')}>right</Button>
            
        </div>
    </div>
  )
}

export default GameWithMoveHistory
