import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './screens/Home'
import Game from './screens/Game';
import Auth from './screens/Auth';
import ProtectedRoute from './screens/ProtectedRoute';
import { UserProvider } from './contexts/userContext';
import { SocketContextProvider } from './contexts/SocketContext';
import React from 'react';
import GameHistory from './screens/GameHistory';
import GameWithMoveHistory from './screens/GameWithMoveHistory';
import UserFetcher from './screens/UserFetcher';
import Error404 from './screens/Error404';

function App() {

  return (
    <>
    <BrowserRouter>
    <UserProvider>
      <SocketContextProvider>
      <Routes>
        <Route path="/" >
          <Route path='login' element={<Auth />} />
        </Route>

        <Route path="/" element={<UserFetcher><ProtectedRoute/></UserFetcher>}>
          <Route index element={<Home />} />
          <Route path='game/:gameId?' element={<Game />} />
          <Route path='history/game' element={<GameHistory/>} />
          <Route path='history/game/:gameId' element={<GameWithMoveHistory/>} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
      </SocketContextProvider>
      </UserProvider>
    </BrowserRouter>
    </>
  )
}

export default App
