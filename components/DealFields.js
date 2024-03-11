import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { startOutgoingCall } from '../shared/socket';
import Footer from './Footer';
import { isValidNip } from '../shared/functions';
import { Html } from 'next/document';
import { HttpStatusCode } from 'axios';

// Shows the contacts in Pipedrive with an ability to filter
const DealFields = (props) => {
  const [nip, setNip] = useState('');  // State to manage the NIP input value
  const [isNipValid, setIsNipValid] = useState(true);
  const [organizationExists, setOrganizationExists] = useState(false);
  const [disabledNip, setDisabledNip] = useState('');
  const [adressField, setAdressField] = useState('');
  const [orgNameField, setOrgNameField] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [orgCreated, setOrgCreated] = useState(false);
  const [orgCreationError, setOrgCreationError] = useState(false);

  /*PART ADDED NEW 11.03.2024*/
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch('/api/getDeals', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (search) data = data.filter((i) => i.title.includes(search));
        setDeals(data);
      });
  }, [router, search]);

  const performSearch = (e) => {
    setSearch(e.target.value);
  };

/* */
  async function getOrganization(nip) {
    return new Promise((resolve, reject) => {
      fetch('/api/getOrganization', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if(data != undefined) {
          data = data.filter((org) => org["7b4ee6ab150271090998e28fcdf397f97b842435"] == nip);
          setVisibility(data);
          resolve(data.length > 0); // resolve with true if organization exists
          } else { 
            console.log("Data is undefined");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  function setVisibility(data) {
    console.log(data);
    //Checks if any object with the given NIP exists in Pipedrive; If so, set the error message visibility to true
    if (data.length > 0) {
      setOrganizationExists(true);
    } else {
      setOrganizationExists(false);
      setDisabledNip(nip);
      getApiRegonOrg();
    }
  }

  async function createOrganization() {
    
    if(isCreating) return; // Prevent function execution if already creating
    setIsCreating(true); // Disable the button
    if (isValidNip(nip)) {
      console.log('createOrganization: NIP is correct');
      const orgExists = await getOrganization(nip);
      console.log("org exists1:" + organizationExists);
      if (!orgExists) {
        let preparedJsonBody = JSON.stringify({
          "name": orgNameField,
          "address": adressField,
          "7b4ee6ab150271090998e28fcdf397f97b842435": nip
        })

        console.log(preparedJsonBody);

        fetch('/api/postOrganization', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          type: 'application/json',
          body: preparedJsonBody
        }).then((res) => {
          console.log("Response post:");
          console.log(res);
          res.json();
          if(res.status == 200) {
            console.log('Organization created successfully');
            setOrgCreated(true);
            setOrgCreationError(false);
          } else { 
            setOrgCreated(false);
            setOrgCreationError(true);
           }
        })
        .catch((error) => {console.log(error)})
        .finally(() =>{
          setIsCreating(false);
        });
      } else {
        console.log('Organization already exists');
        setIsCreating(false);
      }
    } else {
      console.log("createOrganization: NIP is not correct");
      setIsCreating(false);
    }

  };


  function clearFields() {
    console.log('clearFields');
  }

  // Assume we have a state to manage selected products
const [selectedProducts, setSelectedProducts] = useState([]);


// Handle checkbox change
const handleCheckboxChange = (product) => {
  if (selectedProducts.includes(product.id)) {
    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
  } else {
    setSelectedProducts([...selectedProducts, product.id]);
  }
};

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="navbar navbar-light bg-mildgreen">
          <div className="container-fluid">
            <span className="navbar-brand"> 🟢 Witaj, {props.user.name} </span>
          </div>
        </nav>
        <p> Wpisz tytuł szansy sprzedaży</p>
        <div className="input-group mb-3">
          {/*<button type='button' onClick={performSearch}>
            🔍
  </button>*/}
          <input
            type="string"
            className="form-control"
            placeholder="Tytuł szansy sprzedaży"
            onChange={(e) => performSearch(e)}
            id='dealUserInput'
          />
        </div>
        <ol className="contact-list list-group">
          {/* List the deals based on the API response */}
          {deals.map((d) => (
            <li
              key={d.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{d.id}| {d.title} - wartość: {d.formatted_value}</div>
                  {d.orgName}
                </div>
              </div>
            </li>
          ))}
        </ol>
        {/*<p> Wpisz nazwę produktu</p>
        <div className="input-group mb-3">
          {/*<button type='button' onClick={performSearch}>
            🔍
          </button>
          <input
            type="string"
            className="form-control"
            placeholder="Nazwa produktu"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            id='nipUserInput'
          />
        </div>*/}
        {!isNipValid && <p className="text-danger">Nie znaleziono produktu</p>}
        <hr className='custom-hr' />
        <div className="row p-2 ml-3">
    </div>
        {/*<div className="row p-2">
          <div className="d-flex justify-content-end">
            <button type='button' className='btn btn-light m-2' onClick={clearFields}>Odznacz produkty</button>
            <button type='button' className='btn btn-primary m-2' onClick={createOrganization} disabled={isCreating} >Dodaj wybrane produkty</button>
          </div>
      </div>*/}
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
    </div>
  );
};

export default DealFields;
