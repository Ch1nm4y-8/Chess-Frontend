import { useEffect, useRef, useState } from "react"; 
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import useSocket from "../hooks/useSocket";
import MovesView from "../components/MovesView";
import { Chess } from "chess.js";
import {squareMapping , reverseSquareMapping} from "../utils/squareMapping";
import { getDestinationSquare } from "../utils/getDestinationSquare";
import { useNavigate, useParams } from "react-router-dom";
import { ColorEnum ,BoardSquare, PlayerRolesEnum, MessagesType, playersDetailsType} from "../types/gameTypes";
import { GameStatus } from "../types/gameTypes";
import React from "react";
import Input from "../components/Input";
import ChatView from "../components/ChatView";

const Game = () => {
    interface gameResult {
      type:string;
      message:string;
    }


    const socket = useSocket();
    const chessObj = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
    const [moves, setMoves] = useState<string[]>([]);
    const [legalMoves , setLegalMoves] = useState<string[]>([]);
    const [result , setResult] = useState<string>('');
    const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({opponentPlayerName:'Opponent',myPlayerName:''})
    const [playerRole , setPlayerRole] = useState<PlayerRolesEnum|null>(null)
    const [messages, setMessages] = useState<MessagesType[]>([])
    
    const [gameIdToSpectate, setGameIdToSpectate] = useState<string>('');
    const [inviteGameIdToJoin, setInviteGameIdToJoin] = useState<string>('');
    
    const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS)
    const colorRef = useRef('');

    const [player1TimeConsumed , setPlayer1TimeConsumed] = useState<number>(0)
    const [player2TimeConsumed , setPlayer2TimeConsumed] = useState<number>(0)
    const lastTimeTickRef = useRef<number>(Date.now())
    const timerRef = useRef<number>(0)
    const [startTimer,setStartTimer] = useState(false);
    const TotalGameTime = 600000
    
    
    const fromMove = useRef<string|null>(null);
    const navigate = useNavigate();
    const {gameId} = useParams();
  

    const reverseBoard = (board:BoardSquare[][]) =>{
      board.reverse().forEach(row => row.reverse());
    }
    

    const makeMove = (from:string,to:string)=>{
      if (!socket || playerRole!=PlayerRolesEnum.PLAYER) return
      console.log('sending   '+JSON.stringify({"from":from, "to":to}))
      socket.emit('make_move',JSON.stringify({"from":from, "to":to,"player1TimeSpent":player1TimeConsumed, "player2TimeSpent":player2TimeConsumed}));
    }

    const dragHandler = (row1:number, col1:number, row2:number,col2:number )=>{
      const squareMappingFrom = squareMapping(row1,col1,colorRef.current);
      const squareMappingTo = squareMapping(row2,col2,colorRef.current);
      makeMove(squareMappingFrom,squareMappingTo);
    }

    function msToMinSec(ms:number) {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const milliseconds = Math.floor((ms % 60000) / 100000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    }

    const onClickSquareHandler = (row:number, col:number) =>{
      if (!socket || gameStatus.current==GameStatus.GAME_COMPLETED || playerRole!=PlayerRolesEnum.PLAYER){
        console.log('no socket or game is completed or you are a spectator');
        return
      }
      const squareClicked = squareMapping(row,col,colorRef.current);
      console.log('clicked '+squareClicked)

      
      if (!fromMove.current){
        socket.emit('get_moves',JSON.stringify({"square":squareClicked}))
        fromMove.current = squareClicked
      }
      else{
        //socket.emit('make_move',JSON.stringify({"from":fromMove.current, "to":squareClicked}));
        makeMove(fromMove.current,squareClicked)
        fromMove.current = null
        setLegalMoves([]);
      }
    }

    useEffect(()=>{
      if (!socket) {console.log('no socket');return} ;

      if (gameId){
        socket.emit('join_room',JSON.stringify({'gameId':gameId}))
        console.log('emitting join_room thissssssssss is the gameId '+gameId)
      } 
    },[gameId,socket])

    useEffect(() => {
      if (!socket) return ;

      socket.off("join_game").on('join_game',(data)=>{
        const parsedData = JSON.parse(data)
        const {message, color, gameId, opponentPlayerName, myPlayerName,playerRole}= parsedData;
        if (message=='Connected'){

          const chessObject = new Chess()
          chessObj.current=chessObject
          const newBoard = chessObject.board()
          colorRef.current=parsedData.color
          if (color==ColorEnum.BLACK){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
          setPlayersDetails({opponentPlayerName:opponentPlayerName?.toUpperCase(),myPlayerName:myPlayerName?.toUpperCase()})
          setPlayerRole(playerRole)
          navigate(`/game/${gameId}`)
          setStartTimer(true)
        }
      })

      socket.off("rejoin_game").on('rejoin_game',(data)=>{
        const parsedData = JSON.parse(data) 
        const {playerRole}=parsedData
        console.log('rejoiningggggggg '+JSON.stringify(parsedData))
        console.log(parsedData.board_status)
        console.log(typeof parsedData.board_status)

 
        const chessObject = new Chess(parsedData.board_status)
        const restoredOldMoves = parsedData.restoredOldMoves    
        
          chessObj.current=chessObject
          const newBoard = chessObject.board()

          colorRef.current=parsedData.color
          if (parsedData.color==ColorEnum.BLACK){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
          setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : [])
          setPlayer1TimeConsumed(parsedData.player1TimeSpent)
          setPlayer2TimeConsumed(parsedData.player2TimeSpent)
          console.log(parsedData.player1TimeSpent)
          console.log(parsedData.player2TimeSpent)
          setPlayerRole(playerRole)
          setStartTimer(true)
      })

      socket.off("spectate_game").on('spectate_game',(data)=>{
        const parsedData = JSON.parse(data)
        const {playerRole} = parsedData;
        console.log('im spectator , getting the game data '+JSON.stringify(parsedData))
        console.log(parsedData.board_status)
        console.log(typeof parsedData.board_status)

 
        const chessObject = new Chess(parsedData.board_status)
        const restoredOldMoves = parsedData.restoredOldMoves    
        
          chessObj.current=chessObject
          const newBoard = chessObject.board()

          colorRef.current=parsedData.color
          if (parsedData.color==ColorEnum.BLACK){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
          setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : [])
          setPlayer1TimeConsumed(parsedData.player1TimeSpent)
          setPlayer2TimeConsumed(parsedData.player2TimeSpent)
          setPlayerRole(playerRole)
          setStartTimer(true)
      })

      socket.off("game_result").on('game_result',(result:string)=>{
        const parsedResult:gameResult = JSON.parse(result);

        if (parsedResult.type=='WIN'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(parsedResult.message);
        }
        else if(parsedResult.type=='DRAW'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(`DRAW: ${parsedResult.message}`)
        }
        else if(parsedResult.type=='TIMEUP'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(parsedResult.message)
        }

        clearInterval(timerRef.current)
      })



        socket.off("message").on('message',(data)=>{

            console.log('message recieved from server: '+data)
        })

        socket.off("receive_chat").on('receive_chat',(chatMessageObject:string)=>{
          const parsedChatMessageObject = JSON.parse(chatMessageObject);

          setMessages(prev =>[...prev,parsedChatMessageObject])
            
        })

        socket.off("make_move").on('make_move',(move)=>{
          console.log('server sent something from make_move '+move)
          if (!chessObj) return;
          try{

              const parsedMove = JSON.parse(move)

              try{

                chessObj.current.move(parsedMove);
              }
              catch(err){
                console.log('frontend move validation error : '+err)
              }

              const newBoard = chessObj.current.board();
              if (colorRef.current == ColorEnum.BLACK) {
                reverseBoard(newBoard)
              }; 
  
              setBoard(newBoard)
              setMoves(prev => [...prev, parsedMove.to])
              console.log('setting moves ')
              console.log(chessObj.current.ascii())
              setPlayer1TimeConsumed(parsedMove.player1TimeSpent)
              setPlayer2TimeConsumed(parsedMove.player2TimeSpent)
          }
          catch(err){
            console.error("ERRROR CAUGHT : "+err)
          }
        })

        socket.off("get_possible_moves").on('get_possible_moves',(legalMoves)=>{
          const parsedLegalMoves = JSON.parse(legalMoves)


          const sanitizedLegalMoves:string[] = parsedLegalMoves.map((move: string) => {
            const destinationSquare = getDestinationSquare(move);
            //console.log(reverseSquareMapping(destinationSquare, colorRef.current));
            return reverseSquareMapping(destinationSquare, colorRef.current);
          });
          //console.log(sanitizedLegalMoves)

            setLegalMoves(sanitizedLegalMoves);
        })

    }, [socket])

    const joinGameHandler = ()=>{
      if(socket && gameStatus.current!=GameStatus.GAME_COMPLETED) socket.emit('join_game','join_game');
    }

    const spectateGameHandler = ()=>{
      if (!socket) {console.log('no socket'); return}
      navigate('/game/'+gameIdToSpectate)
    }
    
    const createGameHandler = ()=>{
      if (!socket) {console.log('no socket'); return}
      
      socket.emit('create_invite_game','create_invite_game')
    }
    
    const joinWithFriendsGameHandler = () =>{
      if (!socket) {console.log('no socket'); return}
      
      socket.emit('join_invite_game',JSON.stringify({'inviteGameId':inviteGameIdToJoin}))
    }

    const sendChatHandler = (message:string) =>{
      if (!socket) {console.log('no socket'); return}
      
      socket.emit('send_chat',JSON.stringify({userName:playersDetails.myPlayerName,message:message}))
    }
    
    const quitGameHandler = ()=>{
      if(socket && gameStatus.current!=GameStatus.GAME_COMPLETED) socket.emit('quit_game','quit_game');
      navigate('/')
    }
    console.log()
    useEffect(()=>{
      if(startTimer){
        lastTimeTickRef.current = Date.now()

        timerRef.current = setInterval(()=>{
          const now = Date.now()
          const elapsed = now - lastTimeTickRef.current
          if (chessObj.current.turn()=='w'){
            setPlayer1TimeConsumed(prev => prev+elapsed)
          }
          else{
            setPlayer2TimeConsumed(prev => prev+elapsed)
          }
          lastTimeTickRef.current=now 
        },300)  // for blitz/bullet keep it around 100-200, for other maybe keep around 500, for normal chess then 1000
      }

      return (()=> {if(timerRef.current)clearInterval(timerRef.current)})
    },[startTimer])
    
  

  return (
    <div className="flex h-[100vh] justify-between items-center bg-[#3C3C3C] p-10">
        <div className="w-1/6">
          <MovesView moves={moves}/>
        </div>
        <div className="w-3/6 flex justify-center items-center">
            {/* <Timer color='white' timeConsumed={player1TimeConsumed} startTimer={startTimer}/>
            <Timer color='black' timeConsumed={player1TimeConsumed} startTimer={startTimer}/> */}

             <div className="bg-white text-black text-3xl m-2 w-[100%]">Player White Time: {msToMinSec(TotalGameTime - player1TimeConsumed)}</div>
            <div className="bg-black text-white text-3xl m-2 w-[100%]">Player Black Time: {msToMinSec(TotalGameTime - player2TimeConsumed)}</div> 
            {/* <div className="bg-white text-black text-3xl m-2 w-[100%]">Player White Time: { player1TimeConsumed}</div>
            <div className="bg-black text-white text-3xl m-2 w-[100%]">Player Black Time: { player2TimeConsumed}</div> */}
            
            <ChessBoard dragHandler={dragHandler} playersDetails={playersDetails} legalMoves={legalMoves} selectedSquare={reverseSquareMapping(fromMove.current,colorRef.current)} board={board} onClickSquare={onClickSquareHandler}/>

        </div>
        <div className="w-2/8 pt-20">
              {result && <h1 className="text-white text-4xl text-center">{result}</h1>}

            
            {
              !colorRef.current?
            <div className="flex flex-col gap-10 justify-center">
             <Button onClick={()=>{joinGameHandler()}}>JOIN GAME</Button>
             <Button onClick={()=>{createGameHandler()}}>CREATE GAME(Play With Friends)</Button>

             <div className="flex items-center">
             <Input type="text" value={inviteGameIdToJoin} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setInviteGameIdToJoin(e.target.value)}  />
             <Button onClick={()=>{joinWithFriendsGameHandler()}}>JOIN WITH FRIENDS</Button>
             </div>

             <div className="flex items-center">
             <Input type="text" value={gameIdToSpectate} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setGameIdToSpectate(e.target.value)}  />
             <Button onClick={()=>{spectateGameHandler()}}>SPECTATE GAME</Button>
             </div>
             
             
            </div>:
            <div>
             {!result && playerRole==PlayerRolesEnum.PLAYER && <Button onClick={()=>{quitGameHandler()}}>QUIT GAME</Button>}

                <ChatView sendChatHandler={sendChatHandler} messages={messages} playerDetails={playersDetails}/>
            </div>
              }
        
        </div>
    </div>
  )
}

export default Game
