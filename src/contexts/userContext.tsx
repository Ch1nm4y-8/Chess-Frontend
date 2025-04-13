import React,{ createContext, useContext, useState, ReactNode } from 'react';

type UserContextType = {
    user: string | null;
    setUser: (user: string | null) => void;
};

const defaultContext: UserContextType = {
    user: null,
    setUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string|null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};