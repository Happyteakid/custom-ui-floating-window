import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);

  useEffect(() => {
    // Example fetch functions to get products related to the deal and other products
    const fetchProducts = async () => {
      // Fetch deal products
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      let productsData = await dealProductsResponse.json();
      // Convert the productsData object into an array if it's not already
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
      }

      setDealProducts(productsData);
      
      const otherProductsResponse = await fetch(`/api/getProducts`);
      let otherProductsData = await otherProductsResponse.json();
      console.log(otherProductsData);
      setOtherProducts(otherProductsData);
    };
  
    if (dealId) {
      fetchProducts();
    }
  }, [dealId]);
  const goBack = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
      {dealProducts.length > 0 && (
        <>
          <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h4>
          <ul>
            {dealProducts.map((product, index) => (
              <li key={index} className="mb-1">
                Nazwa: {product.name}, Cena: {product.sum_formatted}
                <p>ID produktu: {product.product_id}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
      <>
      Produkty do wyboru:
      </>
      <ol className="contact-list list-group">
      {otherProducts.length > 0 && (
        <>
          <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h4>
          <ul>
            {otherProducts.map((product, index) => (
              <li key={index} className="mb-1">
                Nazwa: {product.name}, Cena: {product.sum_formatted}
                <p>ID produktu: {product.product_id}
                </p>
              </li>
            ))}
          </ul>
        </>)}
        </ol>
      <div className="fixed-bottom">
      <button onClick={goBack} className="bg-black m-3 align-right text-white font-bold py-2 px-4 rounded cursor-pointer">
        Powrót
      </button>
      </div>
    </div>
  );
};

export default AddProduct;
