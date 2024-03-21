import React from 'react';

const DealProductsList = ({ dealProducts }) => {
  if (dealProducts.length === 0) return null;

  return (
    <>
      <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h4>
      <ul>
        {dealProducts.map((product, index) => (
          <li key={index} className="mb-1">
            Nazwa: {product.name}, Cena: {product.sum_formatted}
            <p>ID produktu: {product.product_id}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default DealProductsList;