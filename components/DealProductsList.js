import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';

const DealProductsList = ({ dealProducts, setDealProducts, dealId, refreshing, offerId, offerListArray, setOfferListArray }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerProducts, setOfferProducts] = useState([]);

  const offer = offerListArray?.find(offer => offer.o_id === parseInt(offerId));
  const offerTitle = offer?.na || '';

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (offer && offer.pr) {
        try {
          const productIds = offer.pr.map(product => product.pId);
          const response = await fetch('/api/getProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productIds }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch product details');
          }

          const productDetails = await response.json();

          const mergedProducts = offer.pr.map((product, index) => {
            const productDetail = productDetails.find(detail => detail.id === product.pId) || {};
            return { ...product, name: productDetail.name || 'Unknown', tempId: index };
          });
          console.log('mergedProducts', mergedProducts);
          setOfferProducts(mergedProducts);
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    };

    fetchProductDetails();
  }, [offer]);

  const handleDeleteSelected = async () => {
    if (isCreating || !selectedProducts.length) return;
    setIsCreating(true);
    setLoading(true);
    try {
      console.log('Selected products to delete:', selectedProducts);
      // Delete products from the deal
      const responses = await Promise.all(selectedProducts.map(async (item) => {
        const requestBody = {
          dealId: dealId,
          product_attachment_id: item.dPId,
        };
        console.log('Selected products to delete:', requestBody);
        const preparedJsonBody = JSON.stringify(requestBody);

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
debugger;
      // Filter out deleted products from state
      const updatedDealProducts = dealProducts.filter(
        (product) => !selectedProducts.some((selected) => selected.id === product.id)
      );
      setDealProducts(updatedDealProducts);

      // Update the offerListArray
      if (offer) {
        const selectedIndices = selectedProducts.map(product => product.tempId);
        const updatedOfferProducts = offerProducts.filter(
          (product) => !selectedIndices.includes(product.tempId)
        );

        const cleanedOfferProducts = updatedOfferProducts.map(product => {
          const { tempId, name, ...cleanedProduct } = product;
          return cleanedProduct;
        });

        const updatedOfferListArray = offerListArray.map(offer => {
          if (offer.o_id === parseInt(offerId)) {
            return {
              ...offer,
              pr: cleanedOfferProducts
            };
          }
          return offer;
        });

        setOfferListArray(updatedOfferListArray);
        setOfferProducts(updatedOfferProducts);

        // Update the offer expression in the backend
        const requestBodyUpdateOfferExpression = {
          id: dealId,
          offerString: updatedOfferListArray
        };

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
      }

      setSelectedProducts([]);

    } catch (error) {
      console.error('Error deleting deal products:', error);
    } finally {
      setLoading(false);
      setIsCreating(false);
    }
  };

  const renderDataTable = () => {
    const data = offerId && offer ? offerProducts : dealProducts;
    return (
      <DataTable
        loading={refreshing || loading}
        value={data}
        responsiveLayout="scroll"
        selection={selectedProducts}
        onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="tempId"  // Use tempId as dataKey
        scrollable
        scrollHeight="250px"
        style={{ maxWidth: '1200px' }}
      >
        <Column headerStyle={{ width: '3em' }}></Column>
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        <Column field={offerId && offer ? "dPId" : "id"} header="ID" />
        <Column field="name" style={{ width: '25%' }} header="Nazwa produktu" />
        <Column field={offerId && offer ? "pPr" : "item_price"} header="Cena" />
        <Column field={offerId && offer ? "pDi" : "discount"} header="Rabat" />
        <Column field={offerId && offer ? "pCu" : "currency"} header="Waluta" />
        <Column field={offerId && offer ? "pId" : "product_id"} header="ID produktu" />
        <Column field={offerId && offer ? "pCn" : "quantity"} header="Ilość" />
        <Column field={offerId && offer ? "pCo" : "comments"} style={{ width: '25%' }} header="Komentarz" />
      </DataTable>
    );
  };

  return (
    <div>
      <div className='flex'>
        <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty w ofercie {offerTitle}:</h4>
      </div>
      {renderDataTable()}
      {selectedProducts.length > 0 && (
        <button onClick={handleDeleteSelected} className={`p-button p-button-danger m-2 ${selectedProducts.length > 0 ? 'fadeIn' : ''}`}>
          Usuń zaznaczone produkty
        </button>
      )}
    </div>
  );
};

export default DealProductsList;
