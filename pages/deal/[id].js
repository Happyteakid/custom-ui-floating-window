import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip'; // Import Tooltip from PrimeReact
import GoBackButton from '../../components/GoBackButton';

const DealDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealDetails, setDealDetails] = useState(null);
  const [dealDetailsForTable, setDealDetailsForTable] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [sum, setSum] = useState(0);
  const [percentageDifference, setPercentageDifference] = useState(0);

  useEffect(() => {
    const fetchDealDetailsAndProducts = async () => {
      if (id) {
        try {
          const detailsResponse = await fetch(`/api/getDeal?dealId=${id}`);
          const detailsData = await detailsResponse.json();
          setDealDetails(detailsData);

          // Prepare data for the DataTable
          const detailsArray = [
            { label: 'ID', value: detailsData.id },
            { label: 'ID lejka', value: detailsData.pipeline_id },
            { label: 'Wartość', value: detailsData.formatted_weighted_value },
            { label: 'Nazwa organizacji', value: detailsData.org_id.name },
            { label: 'Adres organizacji', value: detailsData.org_id.address },
          ];
          setDealDetailsForTable(detailsArray);

          const productsResponse = await fetch(`/api/getDealProducts?dealId=${id}`);
          let productsData = await productsResponse.json();

          if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
            productsData = Object.values(productsData);
          }
          setDealProducts(productsData);

          const productIds = productsData.map(product => product.product_id);
          const pricesResponse = await fetch('/api/getProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productIds })
          });
          const pricesData = await pricesResponse.json();

          const productsWithPrices = productsData.map(product => {
            const priceInfo = pricesData.find(price => price.id === product.product_id) || {};
            return {
              ...product,
              price: priceInfo.price,
              currency: priceInfo.currency
            };
          });

          const totalFetchedSum = productsWithPrices.reduce((acc, product) => acc + (product.price || 0), 0);
          const totalItemSum = productsData.reduce((acc, product) => acc + (product.sum || 0), 0);
          const percentageDiff = ((totalFetchedSum - totalItemSum) / totalFetchedSum) * 100;
          console.log('totalFetchedSum:', totalFetchedSum, ' totalItemSum:', totalItemSum)
          setSum(totalFetchedSum);
          setPercentageDifference(percentageDiff);

          console.log('DealDetails: productsWithPrices', productsWithPrices);
          console.log('DealDetails: productsData', productsData);
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      }
    };

    fetchDealDetailsAndProducts();
  }, [id]);

  return (
    <div className='scrollable-container2'>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Szansa sprzedaży</h1>
        <DataTable value={dealDetailsForTable} style={{ maxWidth: '400px' }}>
          <Column field="label" header="Pole" className="fw-bold"/>
          <Column field="value" header="Wartość" />
        </DataTable>
        {percentageDifference < 8 && (
          <Button className='p-button-success m-2 fw-bold' tooltip="Twoja oferta spełnia kryteria.">
            Możliwe wysyłanie ofert
          </Button>
        )}
        {percentageDifference >= 8 && percentageDifference < 18 && (
          <Button className='p-button-warning m-2 fw-bold' tooltip={`Skontaktuj się z Sebastianem Śliwińskim, Batłomiejem Haczek bądź Mirosławem Ościłowskim, rabat wynosi: ${percentageDifference.toFixed(2)}%`}>
            Wymagana dodatkowa akceptacja
          </Button>
        )}
        {percentageDifference >= 18 && (
          <Button className='p-button-danger m-2 fw-bold' tooltip={`Wymaga akceptacji od zarządu, rabat wynosi: ${percentageDifference.toFixed(2)}%`}>
            Wymagana dodatkowa akceptacja
          </Button>
        )}
        <div>
          {dealProducts.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h2>
              <DataTable value={dealProducts} scrollable scrollHeight="300px">
                <Column field="name" header="Nazwa produktu" />
                <Column field="item_price" header="Cena" />
                <Column field="discount" header="Rabat" />
                <Column field="sum" header="Cena z rabatem" />
                <Column field="currency" header="Waluta" />
                <Column field="product_id" header="ID produktu" />
                <Column field="quantity" header="Ilość" />
                <Column field="comments" header="Komentarz" />
              </DataTable>
            </>
          )}
        </div>
        <div className='m-3 '>
          <button onClick={() => router.push(`/addProduct/${id}`)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Dodaj produkt
          </button>
        </div>
        <GoBackButton />
      </div>
    </div>
  );
};

export default DealDetails;
