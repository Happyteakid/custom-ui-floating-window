import { createContext, useContext, useState } from 'react';
import logger from './logger';

const AppContext = createContext();
const log = logger('App Context');

export const AppContextWrapper = ({ children }) => {
  const [user, setUser] = useState({});

  const sharedState = {
    user,
    setUser
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
