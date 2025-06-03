import React, { useEffect, useRef } from 'react'

interface MovesViewProps {
  moves: string[]
}

const MovesView = ({ moves }: MovesViewProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const moveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current && moveRef.current) {
      scrollContainerRef.current.scrollTop = moveRef.current.offsetTop
    }
  }, [moves])

  return (
    <div className="h-[28vh] md:h-[80vh] flex flex-col">
      <h1 className="text-white text-3xl text-center">Moves Made</h1>

      <div className="flex justify-evenly text-white pt-5 pb-2">
        <h1>WHITE</h1>
        <h1>BLACK</h1>
      </div>

      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="grid grid-cols-2 gap-y-3 text-center">
          {moves.map((move, index) => {
            return (
              <div
                className="bg-[#131313] border-y border-y-[#666666] text-[#eeeeee] p-1"
                key={index}
              >
                <div>{move}</div>
              </div>
            )
          })}
          <div ref={moveRef}/>
        </div>
      </div>
    </div>
  )
}

export default MovesView
