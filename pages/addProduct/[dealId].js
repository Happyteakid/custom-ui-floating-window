import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { SelectButton } from 'primereact/selectbutton';
import DealProductsList from '../../components/DealProductsList';
import ProductsListWithFilter from '../../components/ProductsListWithFilter';
import EnumDropdown from '../../components/EnumDropdown';
import GoBackButton from '../../components/GoBackButton';
import { Button } from 'primereact/button';
import { useAppContext } from '../../shared/context';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Toast } from 'primereact/toast';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const { dealProducts, setDealProducts, otherProducts, productFields } = useAppContext();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProducent, setSelectedProducent] = useState(null);
  const [selectedSterowanie, setSelectedSterowanie] = useState(null);
  const [selectedGrupa, setSelectedGrupa] = useState(null);
  const [company, setCompany] = useState();
  const [grupaMateriałowa, setGrupaMateriałowa] = useState();
  const [isCreating, setIsCreating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const toast = useRef(null);

  const companyOptions = [
    { label: 'HTM', value: 'HTM' },
    { label: 'NTM', value: 'NTM' },
  ];
  const grupaMateriałowaOptions = [
    { label: 'Obrabiarki', value: 'Obrabiarki' },
    { label: 'Wypos. obrabiarek', value: 'Wypos. obrabiarek' },
  ];

  const fetchDealProducts = async () => {
    try {
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      if (!dealProductsResponse.ok) {
        throw new Error(`Failed to fetch deal products: ${dealProductsResponse.statusText}`);
      }
      let productsData = await dealProductsResponse.json();
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
        setDealProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching deal products:', error);
    }
  };

  useEffect(() => {
    if (dealId) {
      fetchDealProducts();
    }
  }, [dealId]);

  async function addOfferToDeal() {
    if (isCreating || !selectedProducts.length) return;
    
    if (!offerTitle.trim()) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Tytuł oferty jest wymagany', life: 3000 });
      return;
    }

    setIsCreating(true);
    const offerPayload = {
      id: dealId,
      offerString: JSON.stringify({
        offer_name: offerTitle,
        products: selectedProducts.map(product => ({
          product_id: product.ID,
          product_price: product["Cennik sprzedaży"],
          product_comment: product.comment || "",
          product_count: 1,
          product_currency: "EUR",
          product_discount: 0
        }))
      })
    };
    console.log('offerPayload: ', offerPayload);
    try {
      const response = await fetch('/api/postDealOffer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerPayload),
      });

      if (!response.ok) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Nie udało się stworzyć oferty.', life: 3000 });
        throw new Error(`Failed to post deal offer: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Offer created successfully', data);

      // Fetch updated deal products after adding new products
      await fetchDealProducts();
    } catch (error) {
      console.error('Error posting deal offer:', error);
    } finally {
      setIsCreating(false);
      setShowPopup(false);
    }
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Utworzono pomyślnie ofertę', life: 3000 });
  }

  const buildFieldMappings = (fields) => {
    const keyToNameMapping = {};
    fields.forEach(field => {
      if (field.field_type === 'enum' && field.options) {
        keyToNameMapping[field.key] = {
          name: field.name,
          options: field.options.reduce((acc, option) => {
            acc[option.id.toString()] = option.label;
            return acc;
          }, {})
        };
      } else {
        keyToNameMapping[field.key] = { name: field.name };
      }
    });
    return keyToNameMapping;
  };

  function updateProductsWithFieldValues(products, fields) {
    const fieldMappings = buildFieldMappings(fields);
    //console.log('products: ', products);
    return products.map(product => {
      const updatedProduct = {};

      Object.entries(product).forEach(([key, value]) => {
        const fieldMapping = fieldMappings[key];
        if (fieldMapping) {
          if (fieldMapping.options && fieldMapping.options[value]) {
            updatedProduct[fieldMapping.name] = fieldMapping.options[value.toString()];
          } else {
            updatedProduct[fieldMapping.name] = value;
          }
        } else {
          updatedProduct[key] = value;
        }
      });
      return updatedProduct;
    });
  }

  const renderSelectedProducts = () => {
    return (
      <div>
        <InputText value={offerTitle} id='offerTitle' placeholder='Tytuł oferty' onChange={(e) => setOfferTitle(e.target.value)} className='mb-3' />
        <DataTable value={selectedProducts} dataKey="ID">
          <Column field="ID" header="ID" />
          <Column field="Imię i nazwisko / Nazwa" header="Nazwa" />
          <Column field="Kod produktu" header="Kod produktu" />
          <Column field="Firma" header="Firma" />
          <Column field="Grupa materiałowa" header="Grupa materiałowa" />
          <Column field="Cennik sprzedaży" header="Cennik sprzedaży" />
        </DataTable>
        <Button
          label="Stwórz ofertę"
          icon="pi pi-plus"
          className="p-button m-3 bg-yellow-500"
          onClick={() => addOfferToDeal()}
        />
      </div>
    );
  };

  return (
    <div className='scrollable-container2'>
      <div className="max-w-4xl mx-auto p-4">
        <h3>Szansy sprzedaży - ID {dealId}</h3>
        <DealProductsList dealProducts={dealProducts} setDealProducts={setDealProducts} dealId={dealId} />
        <div className="m-3 text-xl font-bold"> Dodaj produkty</div>
        <div className='flex'>
          <div className="flex justify-content-center m-3">
            <SelectButton value={company} onChange={(e) => setCompany(e.value)} options={companyOptions} />
          </div>
          <div className="flex justify-content-center m-3">
            <SelectButton value={grupaMateriałowa} onChange={(e) => setGrupaMateriałowa(e.value)} options={grupaMateriałowaOptions} />
          </div>
          <div className="flex align-items-center">
          </div>
          <EnumDropdown
            enumName="Typ"
            productFieldsData={productFields}
            placeholderText="Wybierz typ"
            onChange={setSelectedType}
          />
          <EnumDropdown
            enumName="Producent"
            productFieldsData={productFields}
            placeholderText="Wybierz producenta"
            onChange={setSelectedProducent}
          />
          <EnumDropdown
            enumName="Sterowanie"
            productFieldsData={productFields}
            placeholderText="Wybierz sterowanie"
            onChange={setSelectedSterowanie}
          />
          <EnumDropdown
            enumName="Grupa"
            productFieldsData={productFields}
            placeholderText="Wybierz grupę"
            onChange={setSelectedGrupa}
          />
        </div>
        <div>
          <Button
            label="Dodaj produkty"
            icon="pi pi-plus"
            className="p-button m-3"
            onClick={() => addProductsToDeal()}
          />
          <Button className='p-button m-3 bg-yellow-500' onClick={() => setShowPopup(true)} icon="pi pi-plus" label="Utwórz ofertę" />
          <Dialog header="Zaznaczone produkty" visible={showPopup} style={{ width: '50vw' }} onHide={() => setShowPopup(false)}>
            {renderSelectedProducts()}
          </Dialog>
        </div>
        <ProductsListWithFilter
          products={updateProductsWithFieldValues(otherProducts, productFields)}
          selectedProducts={selectedProducts}
          company={company}
          productEnums={productFields}
          onSelectionChange={setSelectedProducts}
          selectedType={selectedType}
          selectedProducent={selectedProducent}
          selectedSterowanie={selectedSterowanie}
          selectedGrupa={selectedGrupa}
          grupaMateriałowa={grupaMateriałowa}
        />
        <GoBackButton />
        <Toast ref={toast} />
      </div>
    </div>
  );
};

export default AddProduct;
