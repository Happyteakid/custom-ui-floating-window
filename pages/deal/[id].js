import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';

const DealDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Access the dynamic part of the URL
  const [dealDetails, setDealDetails] = useState(null);
  const [dealProducts, setDealProducts] = useState([]);

  useEffect(() => {
    const fetchDealDetailsAndProducts = async () => {
      if (id) {
        try {
          // Fetch deal details
          const detailsResponse = await fetch(`/api/getDeal?dealId=${id}`);
          const detailsData = await detailsResponse.json();
          setDealDetails(detailsData);
  
          // Fetch deal products
          const productsResponse = await fetch(`/api/getDealProducts?dealId=${id}`);
          let productsData = await productsResponse.json();
  
          // Convert the productsData object into an array if it's not already
          if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
            productsData = Object.values(productsData);
          }
  
          setDealProducts(productsData);
  
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      }
    };
  
    fetchDealDetailsAndProducts();
  }, [id]);

  const goBack = () => {
    router.back();
  };

  if (!dealDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Szansa sprzedaży</h1>
      <h3 className="text-xl font-semibold">Tytuł: {dealDetails.title}</h3>
      <p className="mb-2">ID: {dealDetails.id}</p>
      <p className="mb-2">ID lejka: {dealDetails.pipeline_id}</p>
      <p className="mb-2">Wartość: {dealDetails.formatted_weighted_value}</p>
      <p className="mb-2">Nazwa organizacji: {dealDetails.org_id.name}</p>
      <p className="mb-4">Adres organizacji: {dealDetails.org_id.address}</p>

      {/* Render deal products */}
      {dealProducts.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h2>
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
      <div className='m-3 '>
      <button onClick={() => router.push(`/addProduct/${id}`)} className="bg-blue border-blue text-white font-bold py-2 px-4 rounded cursor-pointer">
        Dodaj produkt
      </button>

      </div>
      
      <div className="fixed-bottom">
      <button onClick={goBack} className="bg-black m-3 align-right text-white font-bold py-2 px-4 rounded cursor-pointer">
        Powrót
      </button>

      </div>
    </div>
    
  );
};

export default DealDetails;
