import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

const DealProductsList = ({ dealProducts }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  if (dealProducts.length === 0) return null;

  const handleDeleteSelected = () => {
    console.log('Selected products to delete:', selectedProducts);
    // Perform the deletion logic here
  };

  return (
    <div>
      <div className='flex'>
        <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty w ofercie:</h4>
      </div>
      <DataTable
        value={dealProducts}
        responsiveLayout="scroll"
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id" scrollable
        scrollHeight="250px" style={{ maxWidth: '1200px' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        <Column field="product_id" header="ID" style={{ maxWidth: '5px' }}></Column>
        <Column field="name" header="Nazwa" style={{ maxWidth: '100px' }}></Column>
        <Column field="sum_formatted" header="Cena" style={{ maxWidth: '20px' }}></Column>
        <Column field="comments" header="Komentarz" style={{ maxWidth: '100px' }}></Column>
      </DataTable>
      {selectedProducts.length > 0 && (
        <button onClick={handleDeleteSelected} className={`p-button p-button-danger m-2 ${selectedProducts.length > 0 ? 'fadeIn' : ''}`}>
          Usuń zaznaczone produkty
        </button>
      )}
    </div>
  );
};

export default DealProductsList;
