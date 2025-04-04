import { useEffect, useRef, useState } from "react"; 
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import useSocket from "../hooks/useSocket";
import { Chess } from "chess.js";
import {squareMapping , reverseSquareMapping} from "../utils/squareMapping";
import { getDestinationSquare } from "../utils/getDestinationSquare";
import { useNavigate } from "react-router-dom";

const Game = () => {
    interface gameResult {
      type:string;
      message:string;
    }

    const socket = useSocket();
    const [chessObj, setChessObj] = useState(new Chess());
    const [board, setBoard] = useState(chessObj.board());
    const [moves, setMoves] = useState<string[]>([]);
    const [legalMoves , setLegalMoves] = useState<string[]>([]);
    const [from , setFrom ] = useState<string|null>('');
    const [result , setResult] = useState<string>('');

    const colorRef = useRef('');
    const navigate = useNavigate();

    const reverseBoard = (board) =>{
      board.reverse().forEach(row => row.reverse());
    }


    const onClickSquareHandler = (row:number, col:number) =>{
      if (!socket){
        console.log('no socket');
        return
      }
      const squareClicked = squareMapping(row,col,colorRef.current);

      socket.emit('get_moves',JSON.stringify({"square":squareClicked}))

      if (!from){
        setFrom(squareClicked)
      }
      else{
        console.log('sending   '+JSON.stringify({"from":from, "to":squareClicked}))
        socket.emit('make_move',JSON.stringify({"from":from, "to":squareClicked}));
        setFrom(null)
      }
    }
    

    useEffect(() => {
      if (!socket) return ;

      socket.on('join_game',(data)=>{
        let parsedData = JSON.parse(data)
        if (parsedData.message=='Connected'){
          setChessObj(new Chess())
          let newBoard = (chessObj.board())
          colorRef.current=parsedData.color
          if (parsedData.color=='black'){
            reverseBoard(newBoard)
          }
          setBoard(newBoard)
        }
      })

      socket.on('game_result',(result:string)=>{
        const parsedResult:gameResult = JSON.parse(result);

        if (parsedResult.type=='WIN'){
          setResult(parsedResult.message);
        }
        else if(parsedResult.type=='DRAW'){
          setResult(`DRAW: ${parsedResult.message}`)
        }
      })



        socket.on('message',(data)=>{
            console.log('message: '+data)
        })

        socket.on('make_move',(move)=>{
          try{

            console.log('this is '+colorRef.current)
              const parsedMove = JSON.parse(move)
              chessObj.move(parsedMove);
              let newBoard = chessObj.board();
              if (colorRef.current == 'black') {
                reverseBoard(newBoard)
              };
  
              setBoard(newBoard)
              setMoves(prev => [...prev, parsedMove.to])
              console.log('setting moves')
          }
          catch(err){
            console.error("ERRROR CAUGHT : "+err)
          }
        })

        socket.on('get_moves',(legalMoves)=>{
          const parsedLegalMoves = JSON.parse(legalMoves)
          console.log(legalMoves);


          const sanitizedLegalMoves = parsedLegalMoves.map((move: string) => {
            const destinationSquare = getDestinationSquare(move);
            console.log(reverseSquareMapping(destinationSquare, colorRef.current));
            return reverseSquareMapping(destinationSquare, colorRef.current);
          });
          console.log(sanitizedLegalMoves)

            setLegalMoves(sanitizedLegalMoves);
        })

    }, [socket])

    const joinGameHandler = ()=>{
        socket.emit('join_game','join_game');
        navigate('/game/asdf')

    }
  

  return (
    <div className="flex h-[100vh] bg-[#3C3C3C]">
        <div className="w-2/3 flex justify-center items-center">
            <ChessBoard legalMoves={legalMoves} selectedSquare={reverseSquareMapping(from,colorRef.current)} board={board} onClickSquare={onClickSquareHandler}/>
        </div>
        <div className="w-1/3 mx-15 pt-20">
              {result && <h1 className="text-white text-4xl text-center">{result}</h1>}

            
            {
              !colorRef.current?
            <div className="flex justify-center">
             <Button onClick={()=>{joinGameHandler()}}>JOIN GAME</Button>
            </div>:
            <div>
            
              <h1 className="text-white text-3xl text-center">Moves Made</h1>
              <div className="flex justify-evenly text-white pt-10 pb-2">
                <h1>WHITE</h1>
                <h1>BLACK</h1>
              </div>
              <div className="h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-y-3 text-center">
                  {moves.map((move, index) => (
                    <div className="bg-black text-white p-1" key={index}>
                      <div>{move}</div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
              }
        
        
        
        
        </div>
    </div>
  )
}

export default Game
