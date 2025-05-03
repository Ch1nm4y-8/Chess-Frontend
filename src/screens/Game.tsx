import { useEffect, useRef, useState } from "react"; 
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import ChessBoardHeader from "../components/ChessBoardHeader";
import useSocket from "../hooks/useSocket";
import MovesView from "../components/MovesView";
import { Chess } from "chess.js";
import {squareMapping , reverseSquareMapping} from "../utils/squareMapping";
import { getDestinationSquare } from "../utils/getDestinationSquare";
import { useNavigate, useParams } from "react-router-dom";
import { ColorEnum ,BoardSquare, PlayerRolesEnum, MessagesType, playersDetailsType, GameTypesEnum} from "../types/gameTypes";
import { GameStatus } from "../types/gameTypes";
import React from "react";
import Input from "../components/Input";
import ChatView from "../components/ChatView";
import confetti from 'canvas-confetti';

const Game = () => {
    interface gameResult {
      type:string;
      message:string;
      winner:string;
    }

    const [joinedGame, setJoinedGame] = useState(false);
    const socket = useSocket();
    const chessObj = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
    const [moves, setMoves] = useState<string[]>([]);
    const [legalMoves , setLegalMoves] = useState<string[]>([]);
    const [result , setResult] = useState<string>('');
    const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({opponentPlayerName:'Opponent',myPlayerName:''})
    const playersDetailsRef = useRef<playersDetailsType>(playersDetails);
    const [messages, setMessages] = useState<MessagesType[]>([])

    const [showTypes,setShowTypes] = useState<boolean>(false)
    const [gameType, setGameType] = useState<GameTypesEnum>(GameTypesEnum["1|0"])
    const [totalGameTime,setTotalGameTime] = useState<number>(Number(gameType.split('|')[0]) * 60 * 1000);
    useEffect(()=>{
      setTotalGameTime(Number(gameType.split('|')[0]) * 60 * 1000)
    },[gameType])

    useEffect(()=>{
      playersDetailsRef.current = playersDetails;
    },[playersDetails])
    
    const [gameIdToSpectate, setGameIdToSpectate] = useState<string>('');
    const [inviteGameIdToSend, setInviteGameIdToSend] = useState<string>('');
    const [inviteGameIdToJoin, setInviteGameIdToJoin] = useState<string>('');
    
    const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS)
    const colorRef = useRef('');

    const [player1TimeConsumed , setPlayer1TimeConsumed] = useState<number>(0)
    const [player2TimeConsumed , setPlayer2TimeConsumed] = useState<number>(0)
    const lastTimeTickRef = useRef<number>(Date.now())
    const timerRef = useRef<number>(0)
    const [startTimer,setStartTimer] = useState(false);
    
    
    const fromMove = useRef<string|null>(null);
    const navigate = useNavigate();
    const {gameId} = useParams();
  

    const reverseBoard = (board:BoardSquare[][]) =>{
      board.reverse().forEach(row => row.reverse());
    }

    const triggerConfetti=()=> {
      const end = Date.now() + 2 * 1000;
      const confettiInterval = setInterval(()=>{
        if (Date.now() > end) clearInterval(confettiInterval);
        confetti({
            angle: 60,
            particleCount: 100,
            spread: 70,
            origin: {  x: 0, y: 0.5  } 
        });
        confetti({
            angle: 120,
            particleCount: 100,
            spread: 70,
            origin: {  x: 1, y: 0.5  }
        });
        },300)

    }
  
    

    const makeMove = (from:string,to:string)=>{
      if (!socket || playersDetails.myRole!=PlayerRolesEnum.PLAYER) return
      socket.emit('make_move',JSON.stringify({"from":from, "to":to,"player1TimeSpent":player1TimeConsumed, "player2TimeSpent":player2TimeConsumed}));
    }

    const dragHandler = (row1:number, col1:number, row2:number,col2:number )=>{
      if(gameStatus.current == GameStatus.GAME_COMPLETED) return;
      const squareMappingFrom = squareMapping(row1,col1,colorRef.current);
      const squareMappingTo = squareMapping(row2,col2,colorRef.current);
      makeMove(squareMappingFrom,squareMappingTo);
    }

    function msToMinSec(ms:number) {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const milliseconds = Math.floor((ms % 1000) / 100);
      return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(0, '0')}`;
    }

    const onClickSquareHandler = (row:number, col:number) =>{
      if (!socket || gameStatus.current==GameStatus.GAME_COMPLETED || playersDetails?.myRole!=PlayerRolesEnum.PLAYER){
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


      socket.on('state',(msg)=>{
        if (msg=='waiting') setJoinedGame(true);
      })

      socket.on('invite_code',(invite_code)=>{
        setInviteGameIdToSend(invite_code);
      })

      socket.on('invalid',(msg)=>{
        console.log('received invalid msg'+msg)
        alert(msg);
      })

      socket.off("join_game").on('join_game',(data)=>{
        const parsedData = JSON.parse(data)
        const {message, color, gameId, opponentPlayerName, myPlayerName,opponentPlayerId,myPlayerId,playerRole,TotalGametime}= parsedData;
        if (message=='Connected'){

          const chessObject = new Chess()
          chessObj.current=chessObject
          const newBoard = chessObject.board()
          colorRef.current=parsedData.color
          if (color==ColorEnum.BLACK){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
          setPlayersDetails({opponentPlayerName:opponentPlayerName,myPlayerName:myPlayerName,myPlayerId:myPlayerId, opponentPlayerId:opponentPlayerId , myRole:playerRole})
          //setPlayerRole(playerRole)
          navigate(`/game/${gameId}`)
          setStartTimer(true)
          setTotalGameTime(TotalGametime)



          setJoinedGame(true)

        }
      })

      socket.off("rejoin_game").on('rejoin_game',(data)=>{
        const parsedData = JSON.parse(data) 
        const {playerRole, TotalGametime , myPlayerId,myPlayerName,opponentPlayerName,opponentPlayerId}=parsedData
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
          setStartTimer(true)
          setTotalGameTime(TotalGametime)
          setPlayersDetails({myPlayerName:myPlayerName,myPlayerId,opponentPlayerName:opponentPlayerName,opponentPlayerId,myRole:playerRole})        
          
          setJoinedGame(true);
      })

      socket.off("spectate_game").on('spectate_game',(data)=>{
        const parsedData = JSON.parse(data)
        const {playerRole,TotalGametime , player1Name, player2Name} = parsedData;
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
          setPlayersDetails({myPlayerName:player1Name,opponentPlayerName:player2Name,myRole:playerRole})
          setStartTimer(true)
          setTotalGameTime(TotalGametime)


          setJoinedGame(true);
      })

      socket.off("game_result").on('game_result',(result:string)=>{
        const parsedResult:gameResult = JSON.parse(result);

        if (parsedResult.type=='WIN'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(parsedResult.message);

          if(parsedResult.winner == playersDetailsRef.current.myPlayerId && playersDetailsRef.current?.myRole!=PlayerRolesEnum.SPECTATOR) triggerConfetti();
        }
        else if(parsedResult.type=='DRAW'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(`DRAW: ${parsedResult.message}`)
        }
        else if(parsedResult.type=='TIMEUP'){
          gameStatus.current = GameStatus.GAME_COMPLETED
          setResult(parsedResult.message)

          if(parsedResult.winner == playersDetailsRef.current.myPlayerId  && playersDetailsRef.current?.myRole!=PlayerRolesEnum.SPECTATOR) triggerConfetti();

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

        socket.on('redirect',(redirectToGameId)=>{
          const parsedRedirectToGameId = JSON.parse(redirectToGameId);
          navigate('/history/game/'+parsedRedirectToGameId.gameId)
        })

    }, [socket])

    const joinGameHandler = ()=>{
      if(socket && gameStatus.current!=GameStatus.GAME_COMPLETED) socket.emit('join_game',gameType);
      setJoinedGame(true)
    }

    const spectateGameHandler = ()=>{
      if (!socket) {console.log('no socket'); return}
      navigate('/game/'+gameIdToSpectate)
      setJoinedGame(true)
    }
    
    const createGameHandler = ()=>{
      if (!socket) {console.log('no socket'); return}
      
      socket.emit('create_invite_game',gameType)
      setJoinedGame(true)
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
    useEffect(()=>{
      if(startTimer){
        lastTimeTickRef.current = Date.now()

        timerRef.current = setInterval(()=>{
          const now = Date.now()
          const elapsed = now - lastTimeTickRef.current
          if (chessObj.current.turn()=='w'){
            setPlayer1TimeConsumed(prev => {
              const updated = prev+elapsed
              if (updated>=60000) {clearInterval(timerRef.current); return 60000;}
              return updated;
          })
          }
          else{
            setPlayer2TimeConsumed(prev => {
              const updated = prev+elapsed
              if (updated>=60000) {clearInterval(timerRef.current); return 60000;}
              return updated;
          })
          }
          lastTimeTickRef.current=now 

        },300)  // for blitz/bullet keep it around 100-200, for other maybe keep around 500, for normal chess then 1000
      }

      return (()=> {if(timerRef.current)clearInterval(timerRef.current)})
    },[startTimer])
    
  

  return (
    // <div className="bg-gradient-to-t from-black via-[#0e0e0e] to-[#171717] p-10">
    <div className="bg-black">
        {
          (joinedGame||gameId)?
            <div className="flex h-[100vh] justify-around items-center">
              <div className="w-1/6">
                {moves.length>0 && <MovesView moves={moves}/>}
              </div>
              <div className="w-3/6 flex justify-center items-center">
                <div>
                  <ChessBoardHeader name={playersDetails?.opponentPlayerName?playersDetails?.opponentPlayerName:'Opponent'} time={msToMinSec(totalGameTime - (colorRef.current===ColorEnum.WHITE?player2TimeConsumed:player1TimeConsumed))}/>
                  <ChessBoard dragHandler={dragHandler} legalMoves={legalMoves} selectedSquare={reverseSquareMapping(fromMove.current,colorRef.current)} board={board} onClickSquare={onClickSquareHandler}/>
                  <ChessBoardHeader name={playersDetails?.myPlayerName?playersDetails?.myPlayerName:'Me'} time={msToMinSec(totalGameTime - (colorRef.current===ColorEnum.WHITE?player1TimeConsumed:player2TimeConsumed))}/>
                </div>


              </div>
              <div className="w-2/8 pt-20 flex flex-col h-[100vh]">
                  {inviteGameIdToSend && !startTimer && <div title="Click to Copy" onClick={()=>{navigator.clipboard.writeText(inviteGameIdToSend);alert('game id copied')}} className=" bg-[#131313] border border-[#0BA0E2] hover:border-[#0CB07B] cursor-pointer m-5 p-5 place-self-center text-sm"><span className="text-3xl text-center ">Invite Code:</span><br/>{inviteGameIdToSend}</div>}

                    {result && <h1 className="text-white text-4xl text-center">{result}</h1>}

                  <div>
                  {!result && playersDetails?.myRole==PlayerRolesEnum.PLAYER && <Button color='black' onClick={()=>{quitGameHandler()}}>QUIT GAME</Button>}

                      {
                        colorRef.current?
                        <ChatView sendChatHandler={sendChatHandler} messages={messages} playerDetails={playersDetails}/>
                        : 
                        <div>
                          <h1>Waiting for a player to connect....</h1>
                        </div>
                      }
                      
                  </div>
              
              </div>
            </div> :

          <div className="flex h-[100vh] justify-between items-center ">
            <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[30vw] mx-5">
                <h1 className="text-center text-2xl">SELECT GAME TYPE</h1>
                <Button color="#0CB07B" onClick={()=>{setShowTypes(!showTypes)}}>{gameType}</Button>
                            {
                    showTypes &&
                    <div>
                      <div>
                        <button onClick={()=>setGameType(GameTypesEnum["1|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3  w-[5vw] text-black">1 min</button>
                        <button onClick={()=>setGameType(GameTypesEnum["1|1"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">1|1</button>
                        <button onClick={()=>setGameType(GameTypesEnum["2|1"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">2|1</button>
                      </div>
                      <div>
                        <button onClick={()=>setGameType(GameTypesEnum["3|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">3 min</button>
                        <button onClick={()=>setGameType(GameTypesEnum["3|2"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">3|2</button>
                        <button onClick={()=>setGameType(GameTypesEnum["5|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">5 min</button>
                      </div>
                      <div>
                        <button onClick={()=>setGameType(GameTypesEnum["10|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">10 min</button>
                        <button onClick={()=>setGameType(GameTypesEnum["15|10"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">15|10</button>
                        <button onClick={()=>setGameType(GameTypesEnum["30|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[5vw] text-black">30 min</button>
                      </div>
                      <div>
                        <button onClick={()=>setGameType(GameTypesEnum["60|0"])} className="cursor-pointer bg-[#0CB07B] p-1 m-3 w-[86%] text-black">Classic 60 min</button>
                      </div>
                    </div>
                  }
              </div>
            <div>
              <div className="flex gap-10">
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[30vw] hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1  className="text-center text-2xl">CREATE ROOM</h1>
                  <Button color="#0BA0E2" onClick={()=>{createGameHandler()}}>Create Game (Play With Friends)</Button>
                  <h1 className="text-md">Selected Game : <span className="text-[#0CB07B] text-2xl">{gameType}</span></h1>
                </div>
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[30vw] hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">PLAY ONLINE</h1>
                  <Button color="#0BA0E2" onClick={()=>{joinGameHandler()}}>Play Online</Button> 
                  <h1 className="text-md">Selected Game : <span className="text-[#0CB07B] text-2xl">{gameType}</span></h1>
                </div>
              </div>
              <div className="flex gap-10 my-10">
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[30vw] hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">JOIN FRIENDS</h1>
                  <Input type="text" value={inviteGameIdToJoin} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setInviteGameIdToJoin(e.target.value)}  />
                  <Button color="#0BA0E2" onClick={()=>{joinWithFriendsGameHandler()}}>JOIN WITH FRIENDS</Button>
                </div>
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[30vw] hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">SPECTATE GAME</h1>
                  <Input type="text" value={gameIdToSpectate} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setGameIdToSpectate(e.target.value)}  />
                  <Button color="#0BA0E2" onClick={()=>{spectateGameHandler()}}>Spectate Game</Button>
                </div>
              </div>
            </div>
          </div>

        }
        
          

    </div>
  )
}

export default Game
