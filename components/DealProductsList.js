import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

const DealProductsList = ({ dealProducts, dealId }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dealProducts.length === 0) return null;

  const handleDeleteSelected = async () => {
    console.log('Selected products to delete:', selectedProducts);
    if (isCreating || !selectedProducts.length) return;
    setIsCreating(true);
    setLoading(true);
    try {
      const responses = await Promise.all(selectedProducts.map(async (item) => {
        const requestBody = {
          dealId: dealId,
          product_attachment_id: item.id,
        };
        const preparedJsonBody = JSON.stringify(requestBody);
        console.log(requestBody);
  
        return fetch('/api/deleteDealProduct', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: preparedJsonBody,
        });
      }));
  
      const data = await Promise.all(responses.map(res => res.json()));
  
      // Log each response
      data.forEach((responseData, index) => {
        if (responses[index].ok) {
          console.log(`Product ${selectedProducts[index].id} deleted successfully`, responseData);
        } else {
          console.error(`Failed to delete product ${selectedProducts[index].id}`, responseData);
        }
      });
  
    } catch (error) {
      console.error('Error posting deal products:', error);
    } finally {
      setLoading(false);
      setIsCreating(false);
      location.reload();
    }

  };

  return (
    <div>
      <div className='flex'>
        <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty w ofercie:</h4>
      </div>
      <DataTable
        loading={loading}
        value={dealProducts}
        responsiveLayout="scroll"
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id" scrollable
        scrollHeight="250px" style={{ maxWidth: '1200px' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        <Column field="id" header="ID" style={{ maxWidth: '5px', display:'none'}} ></Column>
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