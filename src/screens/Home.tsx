import { useNavigate } from 'react-router-dom'
import React from 'react'

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col gap-10 justify-center'>
      <h1>Home</h1>
      <button className='self-center bg-green-800 py-4 px-8' onClick={()=>navigate('/game/')}>Play Now</button>
      <button className='self-center bg-green-800 py-4 px-8' onClick={()=>navigate('/history/game')}>View History</button>
    </div>
  )
}

export default Home
