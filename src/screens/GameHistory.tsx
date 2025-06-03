import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { GET_GAMES_HISTORY } from '../config';
import { useNavigate } from 'react-router-dom';


interface gamesDataType{
    GameId:string;
    gameStatus:string;
    player1Id: {_id:string, userName:string};
    player2Id: {_id:string, userName:string};
    _id: string;
}

const GameHistory = () => {
    const [gamesData, setGamesData] = useState<gamesDataType[]>([]);
    const navigate = useNavigate();

    useEffect(()=>{
        async function fetchData (){
            const response = await axios.get(GET_GAMES_HISTORY,{ withCredentials: true })
            console.log(response.data.gamesData);
            setGamesData(response.data.gamesData);
        }
        fetchData();

    },[])

    const clickHandler = (gameId:string) =>{
        console.log(gameId)
        navigate(`/history/game/${gameId}`)
    }

  return (
    <div>
      history

      {gamesData.map((game,index) => {
        return (
            <div onClick={()=>clickHandler(game.GameId)} className={`m-auto w-[50vw] p-10 cursor-pointer ${index%2==0?'bg-green-800':'bg-green-600'}`} key={game.GameId}>
                <h1>Player1: {game.player1Id.userName}</h1>
                <h1>Player2: {game.player2Id.userName}</h1>
            </div>
        )
      })}
    </div>
  )
}

export default GameHistory
