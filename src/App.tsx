import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Game from "./screens/Game";
import ProtectedRoute from "./screens/ProtectedRoute";
import { UserProvider } from "./contexts/userContext";
import { SocketContextProvider } from "./contexts/SocketContext";
import React from "react";
import GameHistory from "./screens/GameHistory";
import GameWithMoveHistory from "./screens/GameWithMoveHistory";
import UserFetcher from "./screens/UserFetcher";
import Error404 from "./screens/Error404";
import Layout from "./components/Layout";
import RedirectIfAuthenticated from "./screens/RedirectIfAuthenticated";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";

function App() {
  return (
    <div className="bg-black">
      <BrowserRouter>
        <UserProvider>
          <SocketContextProvider>
            <Routes>
              <Route path="/">
                <Route
                  path="login"
                  element={
                    <UserFetcher>
                      <RedirectIfAuthenticated>
                        <Login />
                      </RedirectIfAuthenticated>
                    </UserFetcher>
                  }
                />
                <Route
                  path="signup"
                  element={
                    <UserFetcher>
                      <RedirectIfAuthenticated>
                        <Signup />
                      </RedirectIfAuthenticated>
                    </UserFetcher>
                  }
                />
                <Route
                  path="forgot-password"
                  element={
                    <UserFetcher>
                      <RedirectIfAuthenticated>
                        <ForgotPassword />
                      </RedirectIfAuthenticated>
                    </UserFetcher>
                  }
                />
              </Route>

              <Route
                path="/"
                element={
                  <UserFetcher>
                    <ProtectedRoute />
                  </UserFetcher>
                }
              >
                <Route path="game/:gameId?" element={<Game />} />
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="history/game" element={<GameHistory />} />
                  <Route path="history/game/:gameId" element={<GameWithMoveHistory />} />
                </Route>
              </Route>

              <Route path="*" element={<Error404 />} />
            </Routes>
          </SocketContextProvider>
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
