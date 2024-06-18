// src/contexts/ProductContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProductContext = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product fields
        const productFieldsResponse = await fetch('/api/getProductFields');
        const productFieldsData = await productFieldsResponse.json();
        setProductFields(productFieldsData);

        // Fetch other products
        const otherProductsResponse = await fetch('/api/getProducts');
        const otherProductsData = await otherProductsResponse.json();
        setOtherProducts(otherProductsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const value = {
    dealProducts,
    setDealProducts,
    otherProducts,
    productFields,
    loading,
    setOtherProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
