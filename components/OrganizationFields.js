import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { startOutgoingCall } from '../shared/socket';
import Footer from './Footer';
import { isValidNip } from '../shared/functions';
import { Html } from 'next/document';

// Shows the contacts in Pipedrive with an ability to filter
const OrganizationFields = (props) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [nip, setNip] = useState('');  // State to manage the NIP input value
  const [isNipValid, setIsNipValid] = useState(true);
  const [organizationExists, setOrganizationExists] = useState(true);
  const [disabledNip, setDisabledNip] = useState('');
  const [adressField, setAdressField] = useState('');
  const [orgNameField, setOrgNameField] = useState('');

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
          data = data.filter((org) => org["7b4ee6ab150271090998e28fcdf397f97b842435"] == nip);
          setVisibility(data);
          resolve(data.length > 0); // resolve with true if organization exists
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
      setAdressField('Bystra 15A, Poznań 61-874');
      setOrgNameField('TUBES INTERNATIONAL SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ');
    }
  }

  async function createOrganization() {
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
      })
    } else {
      console.log('Organization already exists');
      console.log("org exists2:" + organizationExists);
    }
  };

  function getApiRegonOrg(){
    console.log("getApiRegonOrg called");
    fetch('/api/getAPIREGON', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'GET',
      type: 'application/json'
    });

  }
  const performSearch = () => {
    console.log('User input(nip): ' + nip);
    if (!isValidNip(nip)) {
      console.log('NIP is not correct');
      setIsNipValid(false); // Set to false if NIP is invalid
      setOrganizationExists(false); // Set to false if NIP is invalid
      return;
    } else {
      console.log('NIP is correct');
      setIsNipValid(true); // Set to true if NIP is valid
      getOrganization(nip);
      getApiRegonOrg();
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
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="navbar navbar-light bg-mildgreen">
          <div className="container-fluid">
            <span className="navbar-brand"> 🟢 Witaj, {props.user.name} </span>
          </div>
        </nav>
        <p> Wpisz NIP organizacji </p>
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
            <button type='button' className='btn btn-primary m-2' onClick={createOrganization}>Utwórz organizację</button>
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
