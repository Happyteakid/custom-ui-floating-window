import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { Dropdown } from 'primereact/dropdown';
import DealProductsList from '../DealProductsList';
import GoBackButton from '../GoBackButton';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedProducts, setSelectedProducts] = useState({});

  useEffect(() => {

    const fetchProductsAndFields  = async () => {
      setLoading(true);
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      let productsData = await dealProductsResponse.json();
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
      }
      setDealProducts(productsData);
      
      const otherProductsResponse = await fetch(`/api/getProducts`);
      let otherProductsData = await otherProductsResponse.json();
      
      setOtherProducts(otherProductsData);
      const productFieldsResponse = await fetch('/api/getProductFields');
      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);
      setLoading(false);
    };

    if (dealId) {
      fetchProductsAndFields();
    }
  }, [dealId]);

  

  const renderProductField = (rowData, field) => {
    const value = rowData[field.key];
    const options = findFieldOptions(field.name);

    if (field.field_type === 'enum' && options.length > 0 && value !== null && value !== undefined) {
        const selectedOption = options.find(option => option.id.toString() === value.toString());
        return selectedOption ? selectedOption.label : 'N/A';
    }

    if (typeof value === 'object' && value !== null) {
        return value.name || JSON.stringify(value);
    }

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
          value={null}
          options={options}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, [field.key]: e.value }));
          }}
          optionLabel="label"
        placeholder={`Select ${field.name}`}
        className="p-column-filter"
        />
      );
    }
    return null;
  };
  
  const excludedFields = ["Cena", "Jednostka", "Podatek", "Kategoria", "Ceny jednostkowe", "Właściciel", "Aktywne", "Widoczne dla", "Opis"];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
      <>
      <DealProductsList dealProducts={dealProducts} />
      </>
      <DataTable
  value={otherProducts}
  paginator
  rows={4}
  dataKey="id"
  selectionMode="checkbox"
  selection={selectedProducts}
  onSelectionChange={(e) => setSelectedProducts(e.value)}
  loading={loading}
  emptyMessage="Nie znaleziono produktów"
  footer={`W sumie jest ${otherProducts.length} produktów.`}
  className="p-datatable-customers"
  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
  currentPageReportTemplate="Pokaż {first} do {last} z {totalRecords} produktów"
>
  <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
  {productFields
    .filter(field => !excludedFields.includes(field.name))
    .map((field, index) => (
      <Column
        key={field.key}
        field={field.key}
        header={field.name}
        body={(rowData) => renderProductField(rowData, field)}
        sortable
        filter
        filterElement={field.field_type === 'enum' ? (options) => renderFilterElement(field, options) : null}
      />
  ))}
</DataTable>
    <GoBackButton />
    </div>
  );
};

export default AddProduct;
