// src/shared/context.js
import { createContext, useContext, useState, useEffect } from 'react';
import logger from './logger';

const AppContext = createContext();
const log = logger('App Context');

export const AppContextWrapper = ({ children }) => {
  const [user, setUser] = useState({});
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const productFieldsResponse = await fetch('/api/getProductFields');
      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);

      const otherProductsResponse = await fetch('/api/getProducts');
      const otherProductsData = await otherProductsResponse.json();
      setOtherProducts(otherProductsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const sharedState = {
    user,
    setUser,
    dealProducts,
    setDealProducts,
    otherProducts,
    productFields,
    loading,
  };

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
