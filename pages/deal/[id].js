import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
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
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';


const DealDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealDetailsForTable, setDealDetailsForTable] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [sum, setSum] = useState(0);
  const [percentageDifference, setPercentageDifference] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [ofertaDropdown, setOfertaDropdown] = useState([]);
  const [ofertaDropdownValue, setOfertaDropdownValue] = useState(null);
  const [offers, setOffers] = useState([]);
  const [activeProducts, setActiveProducts] = useState(null);
  const [isActiveOffer, setIsActiveOffer] = useState(false);
  const [isNewOfferCreationVisible, setIsNewOfferCreationVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [uwagiOptions, setUwagiOptions] = useState([]);
  const [selectedUwagi, setSelectedUwagi] = useState(null);
  const toast = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const { detailsArray, offerListArray } = await fetchDealDetails(id);
          const dealFields = await fetch(`/api/getDealFields`);
          const dealUwagi = await dealFields.json();
          setDealDetailsForTable(detailsArray);

          // Extract Uwagi options
          const uwagiField = dealUwagi.find(field => field.name == "Uwagi");
          if (uwagiField && uwagiField.options) {
            setUwagiOptions(uwagiField.options.map(option => ({ label: option.label, value: option.id })));
          }

          if (offerListArray.length > 0) {
            setOffers(offerListArray);
            const offerNames = offerListArray.map(offer => ({
              label: offer.na,
              value: offer.na
            }));
            setOfertaDropdown(offerNames);
          }
  
          const { productsWithPrices, totalFetchedSum, percentageDiff } = await fetchDealProducts(id);
          setDealProducts(productsWithPrices);
          setActiveProducts(productsWithPrices);
          setSum(totalFetchedSum);
          setPercentageDifference(percentageDiff);

          let matchingOfferFound = false;
          for (const offer of offerListArray) {
            if (offer.ac) {
              const activeProductIds = productsWithPrices.map(p => p.id);
              const offerProductIds = offer.pr.map(p => p.dPId);
              const match = offerProductIds.every(pId => activeProductIds.includes(pId));
              if (match) {
                setOfertaDropdownValue(offer.na);
                setSelectedOffer(offer);
                setIsActiveOffer(true);
                matchingOfferFound = true;
                break;
              }
            }
          }
  
          setIsNewOfferCreationVisible(!matchingOfferFound);
  
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      }
    };
  
    fetchData();
  }, [id]);
  

  const loadOfferProducts = async (selectedOffer) => {
    if (selectedOffer === 'None') {
      // Load original active products in the deal
      const { productsWithPrices } = await fetchDealProducts(id);
      setDealProducts(productsWithPrices);
      setIsActiveOffer(true);
      return;
    }

    const offer = offers.find(offer => offer.na === selectedOffer);
    console.log('loadOfferProducts: ', offer);
    if (offer) {
      const productIds = offer.pr.map(product => product.pId);
      const productDetails = await fetchProductDetails(productIds);
      const productsWithPrices = offer.pr.map(product => {
        const productInfo = productDetails.find(info => info.id === product.pId) || {};
        console.log('loadOfferProducts, productInfo', productInfo);
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
      setIsActiveOffer(offer.ac);
    }
  };

  const deleteOffer = async (selectedOffer) => {
    const updatedOffers = offers.filter(offer => offer.na !== selectedOffer);
  
    const requestBody = {
      id,
      offerString: updatedOffers
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
      setOfertaDropdown(updatedOffers.map(offer => ({
        label: offer.na,
        value: offer.na
      })));
      setOfertaDropdownValue(null);
      setDealProducts([]);
      setIsNewOfferCreationVisible(true);
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
    updatedProducts[index][field] = field === 'discount' ? parseFloat(newValue) : newValue;
    updatedProducts[index][field] = field === 'item_price' ? parseFloat(newValue) : newValue;
    setDealProducts(updatedProducts);
  
    console.log('Updated dealProducts:', updatedProducts);
  };  

  const saveDealProducts = async () => {
    try {
      // Save deal products
      const responses = await Promise.all(dealProducts.map(async (product) => {
        const requestBody = {
          dealId: id,
          productId: product.id,
          itemPrice: parseFloat(product.item_price),
          discount: parseFloat(product.discount),
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

      const updatedOffers = offers.map(offer => {
        if (offer.na === ofertaDropdownValue) {
          return {
            ...offer,
            pr: offer.pr.map(product => {
              const updatedProduct = dealProducts.find(p => p.product_id === product.pId);
              if (updatedProduct) {
                return {
                  ...product,
                  pPr: parseFloat(updatedProduct.item_price),
                  pDi: parseFloat(updatedProduct.discount),
                  pCo: updatedProduct.comments
                };
              }
              return product;
            })
          };
        }
        return offer;
      });

      const requestBodyUpdateOfferExpression = {
        id,
        offerString: updatedOffers
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
  
      const updateData = await response.json();
      console.log('Offer expression updated successfully', updateData);
      location.reload();
    } catch (error) {
      console.error('Error saving deal products:', error);
    }
  };
  
  
  
  

  const activateOffer = async () => {
    try {
      const selectedOffer = offers.find(offer => offer.na === ofertaDropdownValue);
      if (selectedOffer) {
        // Check if there are active products before attempting to delete
        if (activeProducts && activeProducts.length > 0) {
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
        }
  
        // Save new deal products from selected offer
        const responses = await Promise.all(selectedOffer.pr.map(async (product) => {
          let requestBody = {
            dealId: id,
            productId: product.pId,
            productPrice: product.pPr,
            discount: product.pDi,
            comments: product.pCo
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
                  dPId: updatedProduct ? updatedProduct.id : undefined
                };
              })
            };
          } else {
            return {
              ...offer,
              ac: false,
              pr: offer.pr.map(product => {
                const updatedProduct = productsData.find(p => p.product_id === product.pId);
                return {
                  ...product,
                  dPId: updatedProduct ? updatedProduct.id : undefined
                };
              })
            };
          }
        });
  
        const requestBodyUpdateOfferExpression = {
          id,
          offerString: updatedOffers // Send as JSON object
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
  

  const renderSelectedProducts = () => {
    console.log('Button clicked, activeProducts', activeProducts);
    return (
      <div>
        <InputText value={offerTitle} id='offerTitle' placeholder='Tytuł oferty' onChange={(e) => setOfferTitle(e.target.value)} className='mb-3' />
        <DataTable value={activeProducts} dataKey="id">
          <Column field="product_id" header="ID" />
          <Column field="name" header="Nazwa" />
          <Column field="quantity" header="Ilość" />
          <Column field="sum" header="Cennik sprzedaży" />
        </DataTable>
        <Button
          label="Stwórz ofertę"
          icon="pi pi-plus"
          className="p-button m-3 bg-yellow-500"
          onClick={() => addOfferToDeal()}
        />
      </div>
    );
  };

  async function addOfferToDeal() {
    if (isCreating || !activeProducts.length) return;
    
    if (!offerTitle.trim()) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Tytuł oferty jest wymagany', life: 3000 });
      return;
    }

    setIsCreating(true);
    const offerPayload = {
      id: id,
      offerString: JSON.stringify({
        na: offerTitle,
        ac: true,
        pr: activeProducts.map(product => ({
          pId: product.product_id,
          dPId: product.id,
          pPr: product["sum"],
          pCo: product.comment || "",
          pCn: 1,
          pCu: "EUR",
          pDi: 0
        }))
      })
    };
    console.log('offerPayload: ', offerPayload);
    try {
      const response = await fetch('/api/postDealOffer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerPayload),
      });

      if (!response.ok) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Nie udało się stworzyć oferty.', life: 3000 });
        throw new Error(`Failed to post deal offer: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Offer created successfully', data);

    } catch (error) {
      console.error('Error posting deal offer:', error);
    } finally {
      setIsCreating(false);
      setShowPopup(false);
    }
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Utworzono pomyślnie ofertę', life: 3000 });
    location.reload();
  }

// Function to format selected Uwagi without extra quotes or "\n"
const formatSelectedUwagi = (selectedUwagi, uwagiOptions) => {
  return selectedUwagi
    .map((id, index) => `${index + 1}. ${uwagiOptions.find(option => option.value === id)?.label || ''}`)
    .join('\n'); // Join with actual newlines
};

// Function to save Uwagi
const saveUwagi = async () => {
  if (!selectedUwagi || selectedUwagi.length === 0) {
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Wybierz uwagi przed zapisem', life: 3000 });
    return;
  }

  const formattedUwagi = formatSelectedUwagi(selectedUwagi, uwagiOptions);

  const requestBody = {
    id,
    uwagiString: formattedUwagi
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
      throw new Error(`Failed to save Uwagi: ${response.statusText}`);
    }

    const data = await response.json();
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Uwagi zapisane pomyślnie', life: 3000 });
    console.log('Uwagi saved successfully', data);
  } catch (error) {
    console.error('Error saving Uwagi:', error);
    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Nie udało się zapisać uwag.', life: 3000 });
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
        disabled={!isActiveOffer}
        tooltip={!isActiveOffer ? 'Cannot edit price, discount, or comments for an inactive offer' : ''}
      />
    );
  };

  const handleUwagiChange = (e) => {
    setSelectedUwagi(e.value);
    console.log('Selected Uwagi:', e.value);
  };

  return (
    <div className='scrollable-container2'>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">ID {id} - Szansa sprzedaży</h1>
        <div className="flex justify-between">
    <DataTable 
        id='dealDetails' 
        value={dealDetailsForTable} 
        style={{ maxWidth: fullScreen ? '0px' : '500px', maxHeight: fullScreen ? '0px' : '500px', visibility: fullScreen ? 'hidden' : 'visible' }} 
    >
        <Column field="label" header="Pole" className="fw-bold" />
        <Column field="value" header="Wartość" />
    </DataTable>
    <div className="flex flex-column">
      {uwagiOptions.length > 0 && (
        <>
        <button onClick={saveUwagi} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-4 mb-2 ml-4">
              Zapisz uwagi
            </button>
          <MultiSelect
            id="uwagiDropdown"
            value={selectedUwagi}
            options={uwagiOptions}
            onChange={handleUwagiChange}
            placeholder='Wybierz uwagi'
            display="chip"
            className='w-30rem mb-4' // Added margin to separate from the table below
            filter
            style={{ minWidth: '300px', maxWidth: '500px' }}
          />
          <DataTable
            id='uwagiTable'
            value={uwagiOptions.filter(option => selectedUwagi && selectedUwagi.includes(option.value))}
            style={{ minWidth: '300px', maxWidth: '500px' }}
          >
            <Column field="value" header="Nr" className="fw-bold" />
            <Column field="label" header="Uwaga" />
          </DataTable>
        </>
      )}
    </div>
      </div>
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
            <>
              <h2 className="text-2xl font-semibold mt-4 mb-2 p">Produkty:</h2> 
              <div className='flex justify-content-left m-3'>
              {
                ofertaDropdown.length > 0 &&(
              <Dropdown
                id='ofertaDropdown'
                className='m-2'
                value={ofertaDropdownValue}
                options={ofertaDropdown}
                onChange={(e) => {
                  setOfertaDropdownValue(e.value);
                  loadOfferProducts(e.value);
                  const selected = offers.find(offer => offer.na === e.value);
                  setSelectedOffer(selected);
                }}
                placeholder='Wybierz ofertę'
              />
                )
              }
              
                {isNewOfferCreationVisible && (
                  <Button onClick={() => setShowPopup(true)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 ml-4 px-4 rounded cursor-pointer my-2" id='NewOfferCreationButton'>
                    Utwórz ofertę z aktywnych produktów
                  </Button>
                )}
                <Dialog header="Zaznaczone produkty" visible={showPopup} style={{ width: '50vw' }} onHide={() => setShowPopup(false)}>
                  {renderSelectedProducts()}
                </Dialog>
                {
                  !isActiveOffer && (
                  <Button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 ml-4 px-4 rounded cursor-pointer my-2"
                    onClick={activateOffer}
                  >
                    Aktywuj ofertę w szansie sprzedaży
                </Button>)
                }
                
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
        </div>
        <div className='m-3 '>
          {isActiveOffer && (
            <button onClick={saveDealProducts} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-4">
              Zapisz ofertę
            </button>
          )}
          <button
            onClick={() => {
              if (selectedOffer) {
                router.push(`/addProduct/addProductToOffer/${id}?o_id=${selectedOffer.o_id}`);
              } else {
                router.push(`/addProduct/${id}`);
              }
            }}
            id="AddOfferButton"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Dodaj produkt/ofertę
          </button>
        </div>
        <GoBackButton />
      </div>
      <Toast ref={toast} />
    </div>
  );
};

export default DealDetails;
