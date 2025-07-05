import React, { createContext, useContext, useState, ReactNode } from "react";

interface userDet {
  userName: string;
  photoURL: string;
}

type UserContextType = {
  user: userDet | null;
  setUser: (user: userDet | null) => void;
};

const defaultContext: UserContextType = {
  user: null,
  setUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<userDet | null>(null);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
