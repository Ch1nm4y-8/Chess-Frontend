import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './screens/Home'
import Game from './screens/Game';
import Auth from './screens/Auth';
import ProtectedRoute from './screens/ProtectedRoute';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" >
          <Route path='login' element={<Auth />} />
        </Route>

        <Route path="/" element={<ProtectedRoute/>}>
          <Route index element={<Home />} />
          <Route path='game/:gameId' element={<Game />} />
        </Route>

      </Routes>
      <ToastContainer />
    </BrowserRouter>
    </>
  )
}

export default App
