import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const DealFields = (props) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [originalDeals, setOriginalDeals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [value, setValue] = useState('Wyłącz');
  const [options, setOptions] = useState(['Włącz', 'Wyłącz']);
  const [dealsFields, setDealsFields] = useState([]);
  const [shouldFetchProducts, setShouldFetchProducts] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
    try{
      await fetch('/api/getDeals', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.json())
    .then((data) => {
      setOriginalDeals(data);
      setDeals(data);
    });
    
    // Fetch deals fields
    const dealFieldResponse = await fetch(`/api/getDealFields`);
    const dealsFieldData = await dealFieldResponse.json();
    console.log(dealsFieldData);

    setDealsFields(dealsFieldData);}
    catch (error) {
      console.error("Failed to fetch deal details or products:", error);
    }};
    fetchDeals();
  }, []);
  useEffect(() => {
    let filteredDeals = [...originalDeals];
    if (search) {
      filteredDeals = filteredDeals.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
  
    if (value === 'Włącz') {
      filteredDeals = filteredDeals.filter(d => d['6495917a3d232c7f10b4dbfc7c828a0f29f16eb9'] != null);
      setShouldFetchProducts(true); // Indicate that products need fetching after updating deals
    } else {
      setShouldFetchProducts(false); // No need to fetch products
    }
  
    setDeals(filteredDeals);
  }, [search, value, originalDeals]);
  
  async function updateDeal(){
    async function addProductsToDeal() {
      if (isUpdating) return;
      setIsUpdating(true);
    }
  }
  async function fetchProducts(id) {
    const response = await fetch(`/api/getDealProducts?dealId=${id}`);
    const productsData = await response.json();
    console.log(productsData);
    return productsData;
  }
  
  useEffect(() => {
    const fetchAndSetProductsForDeals = async () => {
      if (!shouldFetchProducts || value !== 'Włącz' || !deals.length) return;
  
      const dealsWithProducts = await Promise.all(deals.map(async (deal) => {
        const products = await fetchProducts(deal.id);
        return { ...deal, products };
      }));
      console.log('Deals with products',dealsWithProducts);
      setDeals(dealsWithProducts);
      setShouldFetchProducts(false);
    };
  
    fetchAndSetProductsForDeals();
  }, [deals, value, shouldFetchProducts]);
  

  const performSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDealClick = (id) => {
    console.log('Navigating to deal with id:', id);
    router.push(`/deal/${id}`);
  };
  const handleAcceptOfferClick = (event, dealId) => {
    event.stopPropagation(); 
    console.log('Accepting offer for dealId:', dealId);
    updateDeal(true);
  };

  const handleRejectOfferClick = (event, dealId) => {
    event.stopPropagation(); 
    console.log('Rejecting offer for dealId:', dealId);
    updateDeal(false);
  };

  const DealList = ({ dealList }) => {
    return (
      <ol className="contact-list list-group">
        {dealList.map((d) => (
          <div
            key={d.id}
            className="list-group-item d-flex justify-content-between align-items-start"
            style={{ cursor: 'pointer' }}
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold text-lg" onClick={() => handleDealClick(d.id)}>{d.id}| {d.title} - wartość: {d.formatted_value}</div>
              {value === 'Włącz' && <div className='fw-bold'>ID etapu w lejku: {d.stage_id}</div>}
              <div>{d['6495917a3d232c7f10b4dbfc7c828a0f29f16eb9'] === '200' ? <span><strong>Status:</strong> Złożono wniosek</span> : null}</div>
              {value === 'Włącz' && d['6495917a3d232c7f10b4dbfc7c828a0f29f16eb9'] === '200' && (
                <div className='m-2'>
                  <DataTable value={Object.values(d.products || {})}>
                      <Column field="product_id" header="Product ID"></Column>
                      <Column field="name" header="Nazwa produktu"></Column>
                      <Column field="sum_formatted" header="Cena"></Column>
                      <Column field="quantity" header="Ilość"></Column>
                      <Column field="comments" header="Komentarz"></Column>
                    </DataTable>
                    <div className="flex m-2">
                      <Button className='m-2 p-button-success' label='Akceptuj możliwość stworzenia oferty' onClick={(e) => handleAcceptOfferClick(e, d.id)} />
                      <Button className='m-2 p-button-danger' label='Odrzuć możliwość stworzenia oferty' onClick={(e) => handleRejectOfferClick(e, d.id)} />
                      </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </ol>
    );
  };


  return (
    <div className="container-fluid scrollable-container2">
      <div className="row">
        <nav className="navbar navbar-light bg-mildgreen">
          <div className="container-fluid">
            <span className="navbar-brand"> 🟢 Witaj, {props.user.name} </span>
          </div>
        </nav>
        <div className="flex">
          <div className='centered-flex fw-bold text-xl'> Tryb akceptacji ofert:</div>
        <SelectButton className='m-3' value={value} onChange={(e) => setValue(e.value)} options={options} />
        </div>
        <div className="input-group mb-3">
          <div className='fw-bold centered-flex m-2'>
          Filtruj:
          </div>
          <input
            type="string"
            className="form-control"
            placeholder="Tytuł szansy sprzedaży"
            onChange={(e) => performSearch(e)}
            id='dealUserInput'
          />
        </div>
        <DealList dealList={deals} />
        <hr className='custom-hr' />
        <div className="row p-2 ml-3">
    </div>
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
    </div>
  );
};

export default DealFields;
