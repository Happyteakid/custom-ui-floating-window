import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { SelectButton } from 'primereact/selectbutton';
import DealProductsList from '../../components/DealProductsList';
import ProductsListWithFilter from '../../components/ProductsListWithFilter';
import GoBackButton from '../../components/GoBackButton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox'


const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [hierarchy, setHierarchy] = useState('196');
  const [filterHierarchy, setFilterHierarchy] = useState(false);
  const [loading, setLoading] = useState(true);

const [companyOptions] = useState([
  { label: 'HTM', value: 'htm' },
  { label: 'NTM', value: 'ntm' }
]);
const [company, setCompany] = useState();
const [isCreating, setIsCreating] = useState(false);



async function addProductsToDeal() {
  if (isCreating || !selectedProducts.length) return;

  setIsCreating(true);

  try {
    const responses = await Promise.all(selectedProducts.map(async (item) => {
      const requestBody = {
        dealId: dealId,
        productId: item.ID,
        productPrice: item["Cennik sprzedaży"]
      };

      const preparedJsonBody = JSON.stringify(requestBody);
      console.log(requestBody);

      return fetch('/api/postDealProducts', {
        method: 'POST',
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
        console.log(`Product ${selectedProducts[index].ID} added successfully`, responseData);
      } else {
        console.error(`Product ${selectedProducts[index].ID} not added`, responseData);
      }
    });

  } catch (error) {
    console.error('Error posting deal products:', error);
  } finally {
    setIsCreating(false);
    setLoading(false);
  }
}

  useEffect(() => {
    const fetchProductsAndFields = async () => {
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      let productsData = await dealProductsResponse.json();
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
      }
      setDealProducts(productsData);

      const otherProductsResponse = await fetch(`/api/getProducts`);
      let otherProductsData = await otherProductsResponse.json();

      const productFieldsResponse = await fetch('/api/getProductFields');
      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);
      console.log('productFieldsData: ',productFieldsData);
      // Update otherProducts with correct values for enums
      const updatedOtherProductsData = updateProductsWithFieldValues(otherProductsData, productFieldsData);
      //console.log(productFieldsData);
      console.log('UpdatedOtherProductsData: ',updatedOtherProductsData);


      setOtherProducts(updatedOtherProductsData);
      
    };

    if (dealId) {
      fetchProductsAndFields();
    }
    setLoading(false);
  }, [dealId]);

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
    console.log('products: ',products);
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

  return (
    <div className='scrollable-container2'>
    <div className="max-w-4xl mx-auto p-4">
            <h3>Szansy sprzedaży - ID {dealId}</h3>
            <DealProductsList dealProducts={dealProducts} dealId={dealId} />
            <div className="m-3 text-xl font-bold"> Dodaj produkty</div>
            <div className='flex'>
            <div className="flex justify-content-center m-3">
                <SelectButton value={company} onChange={(e) => setCompany(e.value)} options={companyOptions} />
            </div>
            <div className="flex align-items-center">
            </div>
            <Button
              label="Dodaj produkty"
              icon="pi pi-plus"
              className="p-button m-3"
              onClick={() => addProductsToDeal()}
            />
            </div>
            <ProductsListWithFilter
              products={otherProducts}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
            />
            <GoBackButton />
        </div>
        </div>
  );
};

export default AddProduct;