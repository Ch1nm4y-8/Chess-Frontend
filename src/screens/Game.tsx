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
    
    const fromMove = useRef<string|null>(null);
    const navigate = useNavigate();
    const {gameId} = useParams();
  

    const reverseBoard = (board:BoardSquare[][]) =>{
      board.reverse().forEach(row => row.reverse());
    }
    

    const makeMove = (from:string,to:string)=>{
      if (!socket) return
      console.log('sending   '+JSON.stringify({"from":from, "to":to}))
      socket.emit('make_move',JSON.stringify({"from":from, "to":to}));
    }

    const dragHandler = (row1:number, col1:number, row2:number,col2:number )=>{
      const squareMappingFrom = squareMapping(row1,col1,colorRef.current);
      const squareMappingTo = squareMapping(row2,col2,colorRef.current);
      makeMove(squareMappingFrom,squareMappingTo);
    }

    const onClickSquareHandler = (row:number, col:number) =>{
      if (!socket || gameStatus.current==GameStatus.GAME_COMPLETED){
        console.log('no socket or game is completed');
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
        }
      })

      socket.off("rejoin_game").on('rejoin_game',(data)=>{
        const parsedData = JSON.parse(data)
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
      })

      socket.off("spectate_game").on('spectate_game',(data)=>{
        const parsedData = JSON.parse(data)
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
          console.log('spectator received these movessss')
          setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : [])
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


    
  

  return (
    <div className="flex h-[100vh] justify-between items-center bg-[#3C3C3C] p-10">
        <div className="w-1/6">
          <MovesView moves={moves}/>
        </div>
        <div className="w-3/6 flex justify-center items-center">
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
