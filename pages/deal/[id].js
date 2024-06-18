import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import GoBackButton from '../../components/GoBackButton';
import { Dropdown } from 'primereact/dropdown';
import { fetchDealDetails, fetchDealProducts } from '../../utils/fetchDealData';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

const DealDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealDetailsForTable, setDealDetailsForTable] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [sum, setSum] = useState(0);
  const [percentageDifference, setPercentageDifference] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [ofertaDropdown, setOfertaDropdown] = useState(['Oferta 1', 'Oferta 2', 'Oferta 3']);
  const [ofertaDropdownValue, setOfertaDropdownValue] = useState(['Oferta 1']);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const { detailsArray, offerListArray } = await fetchDealDetails(id);
          setDealDetailsForTable(detailsArray);
          console.log('offerListArray:', offerListArray);
          
  
          const { productsWithPrices, totalFetchedSum, percentageDiff } = await fetchDealProducts(id);
          setDealProducts(productsWithPrices);
          setSum(totalFetchedSum);
          setPercentageDifference(percentageDiff);
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      }
    };
  
    fetchData();
  }, [id]);

  const onCellEditComplete = (e) => {
    console.log('event', e);
    const { rowData, newValue, field, originalEvent: event } = e;

    // Prevent default behavior to ensure editor callback works correctly
    event.preventDefault();

    const updatedProducts = [...dealProducts];
    const index = updatedProducts.findIndex(product => product.id === rowData.id);
    updatedProducts[index][field] = newValue;
    setDealProducts(updatedProducts);

    console.log('Updated dealProducts:', updatedProducts);
  };

  const saveDealProducts = async () => {
    try {
      const responses = await Promise.all(dealProducts.map(async (product) => {
        const requestBody = {
          dealId: id,
          productId: product.id,
          itemPrice: product.item_price,
          discount: product.discount,
          comments: product.comments
        };

        const preparedJsonBody = JSON.stringify(requestBody);
        console.log(requestBody);

        return fetch('/api/updateDealProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: preparedJsonBody,
        });
      }));

      const data = await Promise.all(responses.map(res => res.json()));
      console.log('Save responses:', data);
      location.reload();
    } catch (error) {
      console.error('Error saving deal products:', error);
    }
  };

  const textEditor = (options, width, type = 'text') => {
    return (
      <InputText
        type={type}
        value={options.value}
        style={{ width }}
        onChange={(e) => {
          options.editorCallback(e.target.value);
          console.log('Changed value:', e.target.value); // Log each change
        }}
      />
    );
  };

  return (
    <div className='scrollable-container2'>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">ID {id} - Szansa sprzedaży</h1>
        <DataTable value={dealDetailsForTable} style={{ maxWidth: fullScreen ? '0px' : '500px', maxHeight: fullScreen ? '0px' : '500px', visibility: fullScreen ? 'hidden' : 'visible' }} >
          <Column field="label" header="Pole" className="fw-bold" />
          <Column field="value" header="Wartość" />
        </DataTable>
        {percentageDifference < 8 && (
          <Button className='p-button-success m-2 fw-bold' tooltip="Twoja oferta spełnia kryteria.">
            Możliwe wysyłanie ofert
          </Button>
        )}
        {percentageDifference >= 8 && percentageDifference < 18 && (
          <Button className='p-button-warning m-2 fw-bold' tooltip={`Skontaktuj się z managerem regionu, rabat wynosi: ${percentageDifference.toFixed(2)}%`}>
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
              <div>
                <Dropdown
                id='ofertaDropdown'
                className='m-2'
                value={ofertaDropdownValue}
                options={ofertaDropdown}
                />
              </div>
              <div className='m-2 font-semibold flex text-xl '>
              <InputSwitch className='mr-2' checked={fullScreen} onChange={(e) => setFullScreen(e.value)} /> Pełen ekran
              </div>
              <DataTable value={dealProducts} scrollable scrollHeight={fullScreen ? '5500px' : '300px'} editMode="cell">
              <Column headerStyle={{ width: '3em' }}></Column>
                <Column field="id" header="ID" />
                <Column field="name" style={{ width: '25%' }} header="Nazwa produktu" />
                <Column field="item_price" header="Cena" onCellEditComplete={onCellEditComplete} editor={(options) => textEditor(options, '120px', 'number')} />
                <Column field="discount" header="Rabat"  onCellEditComplete={onCellEditComplete}editor={(options) => textEditor(options, '75px', 'number')} />
                <Column field="sum" header="Cena z rabatem" />
                <Column field="currency" header="Waluta" />
                <Column field="product_id" header="ID produktu" />
                <Column field="quantity" header="Ilość" />
                <Column field="comments" style={{ width: '25%' }} header="Komentarz" onCellEditComplete={onCellEditComplete} editor={(options) => textEditor(options, '450px', 'text')} />
              </DataTable>
            </>
          )}
        </div>
        <div className='m-3 '>
          <button onClick={saveDealProducts} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-4">Zapisz</button>
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
