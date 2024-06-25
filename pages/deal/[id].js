import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import GoBackButton from '../../components/GoBackButton';
import { Dropdown } from 'primereact/dropdown';
import { fetchDealDetails, fetchDealProducts, fetchProductDetails } from '../../utils/fetchDealData';
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
  const [ofertaDropdown, setOfertaDropdown] = useState(['Brak ofert']);
  const [ofertaDropdownValue, setOfertaDropdownValue] = useState(null);
  const [offers, setOffers] = useState([]);
  const [activeProducts, setActiveProducts] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const { detailsArray, offerListArray } = await fetchDealDetails(id);
          setDealDetailsForTable(detailsArray);
          console.log('Oferta:', offerListArray);
          if (offerListArray.length > 0) {
            // Parse the JSON strings to objects
            const offers = offerListArray.map(offer => JSON.parse(offer));
            
            setOffers(offers);
            // Extract the offer names
            const offerNames = offers.map(offer => offer.na);
            
            // Update the state with the offer names
            setOfertaDropdown(offerNames);
          }
  
          const { productsWithPrices, totalFetchedSum, percentageDiff } = await fetchDealProducts(id);
          setDealProducts(productsWithPrices);
          setActiveProducts(productsWithPrices);
          setSum(totalFetchedSum);
          setPercentageDifference(percentageDiff);
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      }
    };
  
    fetchData();
  }, [id]);

  const loadOfferProducts = async (selectedOffer) => {
    const offer = offers.find(offer => offer.na === selectedOffer);
    console.log('loadOfferProducts: ',offer);
    if (offer) {
      const productIds = offer.pr.map(product => product.pId);
      const productDetails = await fetchProductDetails(productIds);
      const productsWithPrices = offer.pr.map(product => {
        const productInfo = productDetails.find(info => info.id === product.pId) || {};
        console.log('loadOfferProducts, productInfo',productInfo);
        return {
          ...product,
          item_price: product.pPr,
          id: product.dPId,
          comments: product.pCo,
          quantity: product.pCn,
          discount: product.pDi,
          currency: product.pCu,
          name: productInfo.name,
          product_id: productInfo.id
        };
      });
      setDealProducts(productsWithPrices);
    }
  };

  const deleteOffer = async (selectedOffer) => {
    const updatedOffers = offers.filter(offer => offer.na !== selectedOffer);
    const updatedOfferStrings = updatedOffers.map(offer => JSON.stringify(offer));

    const requestBody = {
      id,
      offerString: updatedOfferStrings
    };

    try {
      const response = await fetch('/api/postDeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete offer: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Offer deleted successfully', data);

      setOffers(updatedOffers);
      setOfertaDropdown(updatedOffers.map(offer => offer.na));
      setOfertaDropdownValue(null);
      setDealProducts([]);
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
    location.reload();
  };

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

  const activateOffer = async () => {
    try {
      const selectedOffer = offers.find(offer => offer.na === ofertaDropdownValue);
      if (selectedOffer) {
        // Delete current deal products
        await Promise.all(activeProducts.map(async (product) => {
          const requestBody = {
            dealId: id,
            product_attachment_id: product.id
          };
  
          const response = await fetch('/api/deleteDealProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to delete product: ${response.statusText}`);
          }
        }));
  
        // Save new deal products from selected offer
        const responses = await Promise.all(selectedOffer.pr.map(async (product) => {
          let requestBody = {
            dealId: id,
            productId: product.pId,
            productPrice: product.pPr,
            discount: product.pDi,
            comment: product.pCo
          };
          const response = await fetch('/api/postDealProducts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to save product: ${response.statusText}`);
          }
  
          return response.json();
        }));
  
        console.log('Activate offer responses:', responses);
  
        // Fetch updated deal products to get the new deal_product_id (dPId)
        const productsResponse = await fetch(`/api/getDealProducts?dealId=${id}`);
        let productsData = await productsResponse.json();
        console.log('fetchDealProducts productsData: ', productsData);
  
        // Convert productsData to an array
        productsData = Object.values(productsData);
  
        // Update OfferExpression field with new dPId and Active status
        const updatedOffers = offers.map(offer => {
          if (offer.na === ofertaDropdownValue) {
            return {
              ...offer,
              ac: true,
              pr: offer.pr.map(product => {
                const updatedProduct = productsData.find(p => p.product_id === product.pId);
                return {
                  ...product,
                  dPId: updatedProduct ? updatedProduct.id : product.dPId
                };
              })
            };
          } else {
            return {
              ...offer,
              ac: false
            };
          }
        });
  
        const updatedOfferStrings = updatedOffers.map(offer => JSON.stringify(offer));
  
        const requestBodyUpdateOfferExpression = {
          id,
          offerString: updatedOfferStrings
        };
  
        console.log('requestBodyUpdateOfferExpression', requestBodyUpdateOfferExpression);
  
        const response = await fetch('/api/postDeal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBodyUpdateOfferExpression),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to update offer expression: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log('Offer expression updated successfully', data);
        location.reload();
      }
    } catch (error) {
      console.error('Error activating offer:', error);
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
              <h2 className="text-2xl font-semibold mt-4 mb-2 p">Produkty:</h2> 
              <div className='flex justify-content-left m-3'>
                <Dropdown
                id='ofertaDropdown'
                className='m-2'
                value={ofertaDropdownValue}
                options={ofertaDropdown}
                onChange={(e) => {
                  setOfertaDropdownValue(e.value);
                  loadOfferProducts(e.value);
                }}
                placeholder='Wybierz ofertę'
                />
                <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 ml-4 px-4 rounded cursor-pointer my-2"
                    onClick={activateOffer}
                  >
                    Aktywuj ofertę w szansie sprzedaży
                  </Button>
                {ofertaDropdownValue && (
                  <Button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 ml-4 px-4 rounded cursor-pointer my-2"
                    onClick={() => deleteOffer(ofertaDropdownValue)}
                  >
                    Usuń ofertę
                  </Button>
                )}
              </div>
              <div className='m-2 font-semibold flex text-xl '>
              <InputSwitch className='mr-2' checked={fullScreen} onChange={(e) => setFullScreen(e.value)} /> Pełen ekran
              </div>
              <DataTable id='productList' value={dealProducts} scrollable scrollHeight={fullScreen ? '5500px' : '300px'} editMode="cell">
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
            Dodaj produkt/ofertę
          </button>
        </div>
        <GoBackButton />
      </div>
    </div>
  );
};

export default DealDetails;
