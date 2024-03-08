import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { startOutgoingCall } from '../shared/socket';
import Footer from './Footer';
import { isValidNip } from '../shared/functions';
import { Html } from 'next/document';
import { HttpStatusCode } from 'axios';

// Shows the contacts in Pipedrive with an ability to filter
const OrganizationFields = (props) => {
  const [nip, setNip] = useState('');  // State to manage the NIP input value
  const [isNipValid, setIsNipValid] = useState(true);
  const [organizationExists, setOrganizationExists] = useState(false);
  const [disabledNip, setDisabledNip] = useState('');
  const [adressField, setAdressField] = useState('');
  const [orgNameField, setOrgNameField] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [orgCreated, setOrgCreated] = useState(false);
  const [orgCreationError, setOrgCreationError] = useState(false);

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

  async function getApiRegonOrg() {
    let nipJson = JSON.stringify({ "nip": nip });
    console.log("getApiRegonOrg called");

    var res = await fetch('/api/getAPIREGON', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      type: 'application/json',
      body: nipJson
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    let responseText = await res.text();
    let firstParse = JSON.parse(responseText); // First parse to convert stringified JSON to JSON
    let parsedData = JSON.parse(firstParse);
    console.log("Response data:", parsedData);

    setOrgNameField(parsedData.nazwa);
    setAdressField(parsedData.ulica + ' ' + parsedData.nrLokalu + ' ' + parsedData.nrNieruchomosci + ' ' + parsedData.miejscowosc + ' ' + parsedData.kodPocztowy);
  }

  const performSearch = async () => {
    console.log('User input(nip): ' + nip);
    if (!isValidNip(nip)) {
      console.log('performSearch: NIP is not correct');
      setIsNipValid(false); // Set to false if NIP is invalid
      setOrganizationExists(false); // Set to false if NIP is invalid
      return;
    } else {
      console.log('performSearch: NIP is correct');
      setIsNipValid(true); // Set to true if NIP is valid
      var x = await getOrganization(nip);
      if (!organizationExists) {
        await getApiRegonOrg();
      }
      return;
    }
  };

  function clearFields() {
    setNip('');
    setOrganizationExists(false);
    setIsNipValid(true);
    setDisabledNip('');
    setAdressField('');
    setOrgNameField('');
    setOrgCreated(false);
    setOrgCreationError(false);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="navbar navbar-light bg-mildgreen">
          <div className="container-fluid">
            <span className="navbar-brand"> 🟢 Witaj, {props.user.name} </span>
          </div>
        </nav>
        <p> Wpisz nazwę produktu</p>
        <div className="input-group mb-3">
          <button type='button' onClick={performSearch}>
            🔍
          </button>
          <input
            type="number"
            className="form-control"
            placeholder="10-cyfrowy NIP organizacji"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            id='nipUserInput'
          />
        </div>
        {!isNipValid && <p className="text-danger">Błąd: Nieprawidłowy NIP.</p>}
        {organizationExists && <p className="text-danger">Organizacja o podanym numerze NIP już istnieje!</p>}
        {orgCreated && <p className="text-success">Organizacja została utworzona.</p>}
        {orgCreationError && <p className="text-danger">Błąd podczas tworzenia organizacji.</p>}
        <hr className='custom-hr' />
        <div className='row m-2'>
          <p>Nazwa organizacji:</p>
          <input type='text' value={orgNameField} onChange={(e) => setOrgNameField(e.target.value)} className='form-control user-input' />
          <p>Adres:</p>
          <input type='text' value={adressField} onChange={(e) => setAdressField(e.target.value)} className='form-control user-input' />
          <p>NIP:</p>
          <input type='number' id='submitedNip' readOnly value={disabledNip} disabled className='form-control user-input' />
        </div>
        <div className="row p-2">
          <div className="d-flex justify-content-end">
            <button type='button' className='btn btn-light m-2' onClick={clearFields}>Wyczyść pola</button>
            <button type='button' className='btn btn-primary m-2' onClick={createOrganization} disabled={isCreating} >Utwórz organizację</button>
          </div>
        </div>
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
    </div>
  );
};

export default OrganizationFields;
