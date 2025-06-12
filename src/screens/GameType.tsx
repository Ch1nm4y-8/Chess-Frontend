import React, { useEffect, useRef, useState } from 'react'
import Button from '../components/Button'
import { GameTypesEnum } from '../types/gameTypes'
import { useSocket } from '../contexts/SocketContext'
import { GameStatus,GameModeEnum } from '../types/gameTypes'
import Input from '../components/Input'
import { useNavigate } from 'react-router-dom'


interface gameTypeProp{
  setJoinedGame: (value: boolean) => void;
  setGameMode: (value: GameModeEnum) => void;
  setGameType: (value: GameTypesEnum) => void;
  gameType: GameTypesEnum;
}

const GameType = ({setJoinedGame, setGameMode ,gameType, setGameType}:gameTypeProp) => {
    const [showTypes,setShowTypes] = useState<boolean>(false)
    const [gameIdToSpectate, setGameIdToSpectate] = useState<string>('');
    const [inviteGameIdToJoin, setInviteGameIdToJoin] = useState<string>('');
    

    

    const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS)
    
    
    const socket = useSocket();
    const navigate = useNavigate();


    const gameTypesArray = Object.values(GameTypesEnum).slice(1);



    useEffect(()=>{
        socket.on('pong',(msg)=>{
            alert(msg)
        })
    },[socket])




    const joinGameHandler = ()=>{
        if(socket && gameStatus.current!=GameStatus.GAME_COMPLETED) socket.emit('join_game',gameType);
        setJoinedGame(true)
        // navigate('/game')

        setGameMode(GameModeEnum.ONLINE)
    }

    const createGameHandler = ()=>{
        if (!socket) {console.log('no socket'); return}
        
        socket.emit('create_invite_game',gameType)
        setJoinedGame(true)

        // navigate('/game')


        setGameMode(GameModeEnum.INVITE)
    }

    const spectateGameHandler = ()=>{
      if (!socket || !gameIdToSpectate) return
      navigate('/game/'+gameIdToSpectate)
      setJoinedGame(true)
    }

    const joinWithFriendsGameHandler = () =>{
        if (!socket) {console.log('no socket'); return}
        socket.emit('join_invite_game',JSON.stringify({'inviteGameId':inviteGameIdToJoin}))
        setGameMode(GameModeEnum.INVITE)
    }

  return (
    <div>
          <div className="mt-10 xl:mt-0 flex flex-col lg:h-[100vh] justify-between items-center lg:flex-row gap-5 lg:gap-0">
                <Button color="#0CB07B" onClick={()=>{socket.emit('ping')}}>PING</Button>

            <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[80vw] lg:w-[30vw] mx-5">
                <h1 className="text-center text-2xl">SELECT GAME TYPE</h1>
                <Button color="#0CB07B" onClick={()=>{setShowTypes(!showTypes)}}>{gameType}</Button>
                            {
                    showTypes &&
                    <div className="grid grid-cols-3 gap-4 ">
                            {gameTypesArray.map(gameType => {
                                return <button key={gameType} onClick={()=>setGameType(GameTypesEnum[gameType])} className="cursor-pointer bg-[#0CB07B] py-2  text-black">{gameType}</button>

                            })}
                            <button onClick={()=>setGameType(GameTypesEnum["60|0"])} className="cursor-pointer bg-[#0CB07B] col-span-3 row-span-3  text-black">Classic 60 min</button>
                    </div>
                  }
              </div>
            <div>
              <div className="flex flex-col gap-10 lg:flex-row">
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[80vw] lg:w-[30vw] m-auto lg:m-0 hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">PLAY ONLINE</h1>
                  <Button color="#0BA0E2" onClick={()=>{joinGameHandler()}}>Play Online</Button> 
                  <h1 className="text-md flex items-center gap-1">Selected Game : <span className="text-[#0CB07B] text-2xl">{gameType}</span></h1>
                </div>
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[80vw] lg:w-[30vw] m-auto lg:m-0 hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1  className="text-center text-2xl">CREATE ROOM</h1>
                  <Button color="#0BA0E2" onClick={()=>{createGameHandler()}}>Create Game (Play With Friends)</Button>
                  <h1 className="text-md flex items-center gap-1">Selected Game : <span className="text-[#0CB07B] text-2xl alignmi">{gameType}</span></h1>
                </div>
              </div>
              <div className="flex gap-10 my-10 flex-col lg:flex-row">
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[80vw] lg:w-[30vw] m-auto lg:m-0 hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">SPECTATE GAME</h1>
                  <Input type="text" value={gameIdToSpectate} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setGameIdToSpectate(e.target.value)}  />
                  <Button color="#0BA0E2" onClick={()=>{spectateGameHandler()}}>Spectate Game</Button>
                </div>
                <div className="flex flex-col gap-5 bg-[#131313] p-10 w-[80vw] lg:w-[30vw] m-auto lg:m-0 hover:shadow-white hover:shadow-[-5px_5px_20px_rgba(0,0,0,0.3)]">
                  <h1 className="text-center text-2xl">JOIN FRIENDS</h1>
                  <Input type="text" value={inviteGameIdToJoin} label="Game Id" placeholder="Enter Game Id" onChange={(e)=>setInviteGameIdToJoin(e.target.value)}  />
                  <Button color="#0BA0E2" onClick={()=>{joinWithFriendsGameHandler()}}>JOIN WITH FRIENDS</Button>
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}

export default GameType
