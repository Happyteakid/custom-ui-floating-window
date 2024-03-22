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
import GoBackButton from '../../components/GoBackButton';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';


const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    Id: { value: null, matchMode: FilterMatchMode.EQUALS }
});
  const [loading, setLoading] = useState(true);
  const [sizeOptions] = useState([
    { label: 'Małe', value: 'small' },
    { label: 'Średnie', value: 'normal' },
    { label: 'Duże', value: 'large' }
]);
const [size, setSize] = useState(sizeOptions[0].value);
const [isCreating, setIsCreating] = useState(false);

async function addProductsToDeal() {
    
  if(isCreating) return; // Prevent function execution if already creating
  setIsCreating(true); // Disable the button
  setLoading(true);

  fetch('/api/postDealProducts', {
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
      console.log('Products deal added successfully');
    } else { 
      console.log('Products deal not added - error');
      }
  })
  .catch((error) => {console.log(error)})
  .finally(() =>{
    setIsCreating(false);
  });

  setIsCreating(false);
  }



const products = [
  {
    "ID": 15,
    "Imię i nazwisko / Nazwa": "Centrum obróbcze ACE 540V Siemens 828D",
    "Kod produktu": "ACE540V001",
    "Opis": null,
    "Jednostka": null,
    "Podatek": 0,
    "Kategoria": null,
    "active_flag": true,
    "Aktywne": "Tak",
    "first_char": "c",
    "Widoczne dla": "3",
    "Właściciel": {
        "id": 16023333,
        "name": "Paweł Stawecki",
        "email": "pawel.stawecki@luceosintelligence.com",
        "has_pic": 0,
        "pic_hash": null,
        "active_flag": true,
        "value": 16023333
    },
    "files_count": null,
    "add_time": "2023-11-27 14:29:40",
    "update_time": "2024-03-19 10:07:32",
    "Cennik sprzedaży": 78500,
    "Waluta – Cennik sprzedaży": "EUR",
    "Grupa": "ACE",
    "Model": "ACE",
    "Numer katalogowy": null,
    "Grupa materiałowa": "Obrabiarki",
    "Typ": "Centrum tokarskie",
    "Firma": "NTM",
    "Znak": "1",
    "Producent": "ACE",
    "Sterowanie": "Siemens",
    "Hierarchia": "Alpha",
    "prices": [
        {
            "id": 16,
            "product_id": 15,
            "price": 78500,
            "currency": "EUR",
            "cost": 52150,
            "overhead_cost": 0
        }
    ],
    "product_variations": []
}
]
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
      console.log(productFieldsData);
      // Update otherProducts with correct values for enums
      const updatedOtherProductsData = updateProductsWithFieldValues(otherProductsData, productFieldsData);
      //console.log(productFieldsData);
      console.log(updatedOtherProductsData);
      setOtherProducts(updatedOtherProductsData);
      //setOtherProducts(otherProductsData);
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


  const findFieldOptions = (fieldName) => {
    const field = productFields.find(f => f.name === fieldName);
    return field && field.options ? field.options : [];
  };

  const renderFilterElement = (field) => {
    if (field.field_type === 'enum') {
      const options = findFieldOptions(field.name);
      return (
        <Dropdown
          value={filters[field.name]?.value || ''}
          options={options}
          onChange={(e) => {
            const newFilters = { ...filters, [field.name]: { value: e.value, matchMode: FilterMatchMode.EQUALS }};
            setFilters(newFilters);
          }}
          optionLabel="label"
          placeholder="Select"
          className="p-column-filter"
        />
      );
    }
    else if (field.field_type === 'varchar' || field.field_type === 'text') {
      return (
        <InputText
          value={filters[field.name]?.value || ''}
          onChange={(e) => {
            const newFilters = { ...filters, [field.name]: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS }};
            setFilters(newFilters);
          }}
          className="p-column-filter"
          placeholder={`Search by ${field.name}`}
        />
      );
    }
    return null;
  };

  const onFilter = (e) => {
    setFilters(e.filters);
  };

  
  const excludedFields = ["Cena","Jednostka", "Podatek", "Kategoria", "Właściciel", "Ceny jednostkowe", "Aktywne", "Widoczne dla", "Opis"];

  return (
    <div className="max-w-4xl mx-auto p-4">
            <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
            <DealProductsList dealProducts={dealProducts} />
            <div className='flex'>
            <InputText className='m-3' placeholder='Szukaj'
            onInput={(e) => setFilters({
              global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS }
            })}
            />
            <div className="flex justify-content-center m-3">
                <SelectButton value={size} onChange={(e) => setSize(e.value)} options={sizeOptions} />
            </div>
            <Button
              label="Dodaj produkty"
              icon="pi pi-plus"
              className="p-button m-3"
              onClick={() => addProductsToDeal()}
            />
            </div>
            <DataTable value={otherProducts} paginator rows={6} size={size}
                dataKey="ID" selectionMode="checkbox" selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                
                filters={filters} onFilter={onFilter} loading={loading}
                emptyMessage="Nie znaleziono produktów"
                footer={`W sumie jest ${otherProducts.length} produktów.`}>
                <Column selectionMode="multiple" style={{ width: '3rem' }} />
                {productFields.filter(field => !excludedFields.includes(field.name)).map((field,index) => (
                    <Column key={`${field.key}-${index}`} field={field.name} header={field.name}
                        body={(rowData) => rowData[field.name] ?? 'N/A'}
                        sortable filter filterPlaceholder="Szukaj" filterMatchMode="contains"
                        filterElement={field.field_type === 'enum' ? renderFilterElement(field) : null} />
                ))}
            </DataTable>

            <GoBackButton />
        </div>
  );
};

export default AddProduct;
