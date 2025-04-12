import React, { useEffect, useRef } from 'react'
interface MovesViewProps{
    moves:string[],
}

const MovesView = ({moves}:MovesViewProps) => {
    const moveRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        moveRef.current?.scrollIntoView({ behavior: "smooth" });
    },[moves])

  return (
    <div>
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
  )
}

export default MovesView
