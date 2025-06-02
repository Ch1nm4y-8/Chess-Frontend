import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChessBoard from '../components/ChessBoard';
import { Chess } from "chess.js";
import { BoardSquare, ColorEnum } from '../types/gameTypes';
import axios from 'axios';
import { GET_GAME_WITH_MOVE_HISTORY } from '../config/endpoints';
import Button from '../components/Button';
import { useUser } from '../contexts/userContext';
import { playersDetailsType ,resultInfoType} from '../types/gameTypes';
import MovesView from '../components/MovesView';
import ChessBoardHeader from '../components/ChessBoardHeader';
import { STATUS } from '../types/gameTypes';
import ResultModal from '../components/ResultModal';
import Error404 from './Error404';
import ChessLoader from '../components/ChessLoader';


const GameWithMoveHistory = () => {
    const {gameId} = useParams();
    const chessObj = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
    const boardStates = useRef<{boardStatus:string,toMove:string,player1Time:number,player2Time:number}[]>([]);
    const [movesList, setMovesList] = useState<string[]>([]);
    const [playersTime, setPlayersTime] = useState({player1Time:'00:00',player2Time:'00:00'});
    const [status, setStatus] = useState(STATUS.LOADING)
    const [result, setResult] = useState<resultInfoType|null>(null);
    
    const { user } = useUser();
    const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({opponentPlayerName:'Opponent',myPlayerName:user||'Me'})
    const currentMove = useRef<number>(0)

    useEffect(()=>{
        const fetchGameDataWithMoves = async()=>{
            try{
                const response = await axios.get(GET_GAME_WITH_MOVE_HISTORY+gameId,{withCredentials:true});
                console.log('❌❌❌❌')
                console.log(response.data)
                boardStates.current=response.data.movesData
    
                console.log(response.data)
                const {player1Id, player2Id, winner, gameResultReason, gameType, gameResult} = response.data.gameData;
                const amIPlayer1 = player1Id.userName === user;
                const myPlayerName = amIPlayer1 ? player1Id.userName : player2Id.userName;
                const opponentPlayerName = amIPlayer1 ? player2Id.userName : player1Id.userName;
                const myColor = amIPlayer1 ? ColorEnum.WHITE : ColorEnum.BLACK;
                const opponentColor = amIPlayer1 ? ColorEnum.BLACK : ColorEnum.WHITE;
    
                setPlayersDetails({
                    myPlayerName,
                    opponentPlayerName,
                    myColor,
                    opponentColor
                });
                setResult({
                    winner:winner===player2Id._id?ColorEnum.BLACK:ColorEnum.WHITE,
                    gameResultReason:gameResultReason,
                    gameResult:gameResult
                })
    
                const totalGameTime= Number(gameType?.split('|')[0])*60 * 1000
                const timeInMinSec = msToMinSec(totalGameTime)
                setPlayersTime({player1Time:timeInMinSec,player2Time:timeInMinSec})
                setStatus(STATUS.SUCCESS)
            }
            catch(err){
                console.log(err)
                // @ts-expect-error err
                if (err?.response?.status === 404){
                    setStatus(STATUS.NOT_FOUND)
                }
                else{
                    setStatus(STATUS.ERROR)
                }
            }

        }
        fetchGameDataWithMoves();
    },[])

    const ButtonHandler=(type:string)=>{
        console.log('before current Move '+currentMove.current)
        if (type=='prev'){
            if (currentMove.current<=0) return;
            currentMove.current-=1
            setMovesList(prev =>prev.slice(0, -1))
        }
        else if (type=='next'){
            if (currentMove.current>=boardStates.current.length-1) {
                const dialog = document.getElementById('result_modal');
                if (dialog instanceof HTMLDialogElement) {
                    dialog.showModal();
                }
                return;
            }
            currentMove.current+=1
            setMovesList(prev => [...prev,boardStates.current[currentMove.current].toMove])
        }
        
        setPlayersTime({player1Time:msToMinSec(boardStates.current[currentMove.current].player1Time),player2Time:msToMinSec(boardStates.current[currentMove.current].player2Time)})
        console.log(`current Move number : ${currentMove.current}    ${JSON.stringify(boardStates.current[currentMove.current])}`)
        chessObj.current.load(boardStates.current[currentMove.current].boardStatus)
        setBoard(chessObj.current.board());

    }

    function msToMinSec(ms:number) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(0, '0')}`;
    }

    if(status == STATUS.LOADING) return <div className='w-[100vw] h-[100vh] flex justify-center items-center bg-black'><ChessLoader /></div>
    if(status == STATUS.NOT_FOUND) return <Error404/>
  return (
    <div className='flex justify-evenly items-center bg-black h-[100vh]'>
        <div className='w-1/4'>
            <MovesView moves={movesList}></MovesView>
        </div>

        <div>
            <ChessBoardHeader imageURL='' name={playersDetails.opponentPlayerName} time={playersTime.player2Time} />
            <ChessBoard chessObj={chessObj.current} board={board}/>
            <ChessBoardHeader imageURL='' name={playersDetails.myPlayerName} time={playersTime.player1Time} />
        </div>

        <div className='flex gap-5'>
            <Button color='#0CB07B' onClick={()=>ButtonHandler('prev')}>Previous</Button>
            <Button color='#0CB07B' onClick={()=>ButtonHandler('next')}>Next</Button>            
        </div>


        <ResultModal result={result}/>
    </div>
  )
}

export default GameWithMoveHistory
