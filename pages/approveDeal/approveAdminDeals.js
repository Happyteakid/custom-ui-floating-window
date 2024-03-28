import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

import GoBackButton from '../../components/GoBackButton';

const DealDetails = () => {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [dealsFields, setDealsFields] = useState([]);
  const excludedFields = ["Cena","Jednostka", "Podatek", "Kategoria", "Właściciel", "Ceny jednostkowe", "Aktywne", "Widoczne dla", "Opis"];
  useEffect(() => {
    const fetchDeals = async () => {

        try {
          // Fetch deals
          const dealsResponse = await fetch(`/api/getDeals`);
          const dealsData = await dealsResponse.json();
          console.log(dealsData);
          setDeals(dealsData);

          // Fetch deals fields
          const dealFieldResponse = await fetch(`/api/getDealFields`);
          const dealsFieldData = await dealFieldResponse.json();
          console.log(dealsFieldData);
          setDealsFields(dealsFieldData);
  
        } catch (error) {
          console.error("Failed to fetch deal details or products:", error);
        }
      
    };
  
    fetchDeals();
  }, []);


  const renderFilterElement = (field) => {
  };
  const renderColumnData = (rowData, field) => {
    let data = rowData[field.key];
    if (typeof data === 'object' && data !== null && data.hasOwnProperty('name')) {
        return data.name;
    } 
    else if (typeof data === 'object' && data !== null) {
        return data.id ? data.id.toString() : 'N/A';
    } 
    else if (Array.isArray(data)) {
        return data.join(', ');
    } else {
        return data ?? 'N/A';
    }
};
  
  if (!deals) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Szanse sprzedaży do zaakceptowania</h1>
      <DataTable value={deals} paginator rows={1} dataKey="ID"
                 emptyMessage="Nie znaleziono produktów"
                 footer={`W sumie jest ${deals.length} produktów.`}>
        <Column selectionMode="multiple" style={{ width: '3rem' }} />
        {deals.forEach(element => {
            <Column value={element}></Column>
        })}
      </DataTable>
      
      <div className="fixed-bottom">
        <GoBackButton />
      </div>
    </div>
  );
};

export default DealDetails;
