import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { startOutgoingCall } from '../shared/socket';
import Footer from './Footer';

// Shows the contacts in Pipedrive with an ability to filter
const ContactList = (props) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch('/api/getContacts', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (search) data = data.filter((i) => i.contactName.includes(search));
        setContacts(data);
      });
  }, [router, search]);

  const performSearch = (e) => {
    setSearch(e.target.value);
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
          <button className=''>
          🔍
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="10-cyfrowy NIP organizacji"
            onChange={(e) => performSearch(e)}
          />
        </div>
        <ol className="contact-list list-group">
          {contacts.map((d) => (
            <li
              key={d.contactId}
              onClick={() => startOutgoingCall(props, d.contactId)}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <div className="ms-2 me-auto">
                  <div className="fw-bold"> {d.contactName} </div>
                  {d.contactNumber}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="fixed-bottom">
        <Footer />
      </div>
    </div>
  );
};

export default ContactList;
