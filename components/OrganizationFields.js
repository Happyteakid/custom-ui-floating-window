import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { startOutgoingCall } from '../shared/socket';
import Footer from './Footer';
import {isValidNip} from '../shared/functions';

// Shows the contacts in Pipedrive with an ability to filter
const OrganizationFields = (props) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);
  const [nip, setNip] = useState('');  // State to manage the NIP input value
  const [isNipValid, setIsNipValid] = useState(true);

  async function getOrganization(nip) {
    fetch('/api/getOrganization', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.json())
    .then((data) => {
        //if (search) data = data.filter((i) => i.contactName.includes(search));
        setVisibility(data);
    })
    .catch((error) => {
        console.log(error);
    });
  }
  

function setVisibility(data){
console.log(data);
}

  const performSearch = () => {
    console.log('User input(nip): '+ nip);
    if(!isValidNip(nip)){
      console.log('NIP is not correct');
      setIsNipValid(false); // Set to false if NIP is invalid
      return;
    } else{
      console.log('NIP is correct');
      setIsNipValid(true); // Set to true if NIP is valid
      if(isNipValid){
        getOrganization(nip);
      }
      return;
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
        <hr className='custom-hr'/>
        <div className='row m-2'>
          <p>Nazwa organizacji:</p>
          <input type='text' className='form-control user-input'/>
          <p>Adres:</p>
          <input type='text' className='form-control user-input'/>
          <p>NIP:</p>
          <input type='number' className='form-control user-input'/>
        </div>
        <div className="row p-2">
          <div className="d-flex justify-content-end">
            <button type='button' className='btn btn-primary'>Utwórz organizację</button>
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
