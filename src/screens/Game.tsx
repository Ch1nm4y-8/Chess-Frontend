import { useEffect, useRef, useState } from "react"; 
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import useSocket from "../hooks/useSocket";
import { Chess } from "chess.js";
import {squareMapping , reverseSquareMapping} from "../utils/squareMapping";
import { getDestinationSquare } from "../utils/getDestinationSquare";
import { useNavigate } from "react-router-dom";
import { ColorEnum ,BoardSquare} from "../types/gameTypes";
import { GameStatus } from "../types/gameTypes";
import React from "react";

const Game = () => {
    interface gameResult {
      type:string;
      message:string;
    }

    interface playersDetails{
      myPlayerName: string;
      opponentPlayerName: string;
  }

    const socket = useSocket();
    const chessObj = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
    const [moves, setMoves] = useState<string[]>([]);
    const [legalMoves , setLegalMoves] = useState<string[]>([]);
    const fromMove = useRef<string|null>(null);
    const [result , setResult] = useState<string>('');
    const [playersDetails, setPlayersDetails] = useState<playersDetails>({opponentPlayerName:'Opponent',myPlayerName:'Me'})

    const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS)
    const colorRef = useRef('');
    const moveRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
      moveRef.current?.scrollIntoView({ behavior: "smooth" });
    },[moves])

    useEffect(() => {
      if (!socket) return ;

      socket.off("join_game").on('join_game',(data)=>{
        const parsedData = JSON.parse(data)
        const {message, color, roomId, opponentPlayerName, myPlayerName}= parsedData;
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
          navigate(`/game/${roomId}`)
        }
      })

      socket.off("rejoin_game").on('rejoin_game',(data)=>{
        const parsedData = JSON.parse(data)
        console.log('rejoiningggggggg '+JSON.stringify(parsedData))
        console.log(parsedData.board_status)
        console.log(typeof parsedData.board_status)

 
        const chessObject = new Chess(parsedData.board_status)
        const restoredOldMoves = parsedData.restoredOldMoves    
        console.log(chessObject.ascii())
        
          chessObj.current=chessObject
          const newBoard = chessObject.board()

          colorRef.current=parsedData.color
          if (parsedData.color==ColorEnum.BLACK){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
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
            console.log(chessObj.current.ascii())
        })

        socket.off("make_move").on('make_move',(move)=>{
          console.log('server sent something from make_move '+move)
          if (!chessObj) return;
          console.log(chessObj.current.ascii())
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
    
    const quitGameHandler = ()=>{
      if(socket && gameStatus.current!=GameStatus.GAME_COMPLETED) socket.emit('quit_game','quit_game');
      navigate('/')
    }
    
  

  return (
    <div className="flex h-[100vh] bg-[#3C3C3C]">
        <div className="w-2/3 flex justify-center items-center">
            <ChessBoard dragHandler={dragHandler} playersDetails={playersDetails} legalMoves={legalMoves} selectedSquare={reverseSquareMapping(fromMove.current,colorRef.current)} board={board} onClickSquare={onClickSquareHandler}/>
        </div>
        <div className="w-1/3 mx-15 pt-20">
              {result && <h1 className="text-white text-4xl text-center">{result}</h1>}

            
            {
              !colorRef.current?
            <div className="flex justify-center">
             <Button onClick={()=>{joinGameHandler()}}>JOIN GAME</Button>
            </div>:
            <div>
             {!result && <Button onClick={()=>{quitGameHandler()}}>QUIT GAME</Button>}
            
              <h1 className="text-white text-3xl text-center">Moves Made</h1>
              <div className="flex justify-evenly text-white pt-10 pb-2">
                <h1>WHITE</h1>
                <h1>BLACK</h1>
              </div>
              <div className="h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-y-3 text-center">
                  {moves.map((move, index) => (
                    <div className="bg-black text-white p-1" key={index}>
                      <div>{move}</div>
                    </div>
                  ))}
                  <div ref={moveRef}/>
                </div>
              </div>
              </div>
              }
        
        </div>
    </div>
  )
}

export default Game
