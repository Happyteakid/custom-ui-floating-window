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
import DealProductsList from '../../components/DealProductsList';
import GoBackButton from '../../components/GoBackButton';
import { InputText } from 'primereact/inputtext';

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
    id: { value: null, matchMode: FilterMatchMode.EQUALS }
});
  const [loading, setLoading] = useState(true);

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

      // Update otherProducts with correct values for enums
      const updatedOtherProductsData = updateProductsWithFieldValues(otherProductsData, productFieldsData);
      console.log(updatedOtherProductsData);
      //console.log(otherProductsData);
      setOtherProducts(updatedOtherProductsData);
      //setOtherProducts(otherProductsData);
    };

    if (dealId) {
      fetchProductsAndFields();
    }
    setLoading(false);
  }, [dealId]);

  function updateProductsWithFieldValues(products, fields) {
    return products.map(product => {
      const updatedProduct = { ...product };

      fields.forEach(field => {
        if (field.field_type === 'enum' && field.options && product[field.key]) {
          const matchingOption = field.options.find(option => option.id.toString() === product[field.key].toString());
          if (matchingOption) {
            updatedProduct[field.key] = matchingOption.label;
          }
        }
      });

      return updatedProduct;
    });
  }

  

  const renderProductField = (rowData, field) => {
    const value = rowData[field.key];
/*
    if (typeof value === 'object' && value !== null) {
      console.log(value);
        return value.name || JSON.stringify(value);
    }
*/
//    console.log(value);
    return value ?? 'N/A';
};

  const findFieldOptions = (fieldName) => {
    const field = productFields.find(f => f.name === fieldName);
    return field && field.options ? field.options : [];
  };

  const renderFilterElement = (field) => {
    if (field.field_type === 'enum') {
        const options = findFieldOptions(field.name);
        return (
            <Dropdown
                value={filters[field.key] ? filters[field.key].value : null}
                options={options}
                onChange={(e) => setFilters({ ...filters, [field.key]: { value: e.value, matchMode: 'equals' } })}
                optionLabel="label"
                placeholder="Select"
                className="p-column-filter"
            />
        );
    }
    if (field.field_type == 'text') {
      return (
          <InputText
              value={filters[field.key]?.value || ''}
              onChange={(e) => setFilters({ ...filters, [field.key]: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
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
    <div className='scrollable-container2'>
    <div className="max-w-4xl mx-auto p-4">
            <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
            <DealProductsList dealProducts={dealProducts} />
            <InputText className='m-3' placeholder='Szukaj'
            onInput={(e) => setFilters({
              global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS }
            })}
            />
            <DataTable value={otherProducts} paginator rows={4}
                dataKey="id" selectionMode="checkbox" selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                filters={filters} onFilter={onFilter} loading={loading}
                emptyMessage="Nie znaleziono produktów"
                footer={`W sumie jest ${otherProducts.length} produktów.`}>
                <Column selectionMode="multiple" style={{ width: '3rem' }} />
                {productFields.filter(field => !excludedFields.includes(field.name)).map((field, index) => (
                    <Column key={field.key} field={field.key} header={field.name} body={(rowData) => renderProductField(rowData, field)}
                        sortable filter filterPlaceholder="Szukaj" filterMatchMode="contains"
                        filterElement={field.field_type === 'enum' ? renderFilterElement(field) : null} />
                        
                ))}
            </DataTable>
            <GoBackButton />
        </div>
        </div>
  );
};

export default AddProduct;