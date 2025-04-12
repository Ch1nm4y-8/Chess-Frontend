import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-col justify-center'>
      <h1>Home</h1>
      <button className='bg-green-200 py-4 px-8' onClick={()=>navigate('/game/')}>Play Now</button>
    </div>
  )
}

export default Home
