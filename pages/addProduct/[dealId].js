import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    Grupa: '',
    Model: '',
    GrupaMateriałowa: '',
    Typ: '',
    Firma: '',
    Znak: '',
    Producent: '',
    Sterowanie: '',
    Hierarchia: ''
  });

  useEffect(() => {

    const fetchProductsAndFields  = async () => {
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      let productsData = await dealProductsResponse.json();
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
      }

      console.log('Product data');
      console.log(productsData);
      setDealProducts(productsData);
      
      const otherProductsResponse = await fetch(`/api/getProducts`);
      let otherProductsData = await otherProductsResponse.json();
      
      console.log('Other Product data');
      console.log(otherProductsData);
      setOtherProducts(otherProductsData);
      // Fetch product fields
      const productFieldsResponse = await fetch('/api/getProductFields');
      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);
      const initialFilters = productFields.reduce((acc, field) => {
        acc[field.key] = '';
        return acc;
      }, {});
      setFilters(initialFilters);
    };

    if (dealId) {
      fetchProductsAndFields();
    }
  }, [dealId]);

  const handleCheckboxChange = (productId) => {
    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    setSelectedProducts(newSelectedProducts);
  };
  
  const isChecked = (productId) => {
    return selectedProducts.includes(productId);
  };

  const handleChange = (fieldKey, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [fieldKey]: value,
    }));
  };

  const findFieldOptions = (fieldName) => {
    const field = productFields.find(f => f.name === fieldName);
    return field && field.options ? field.options : [];
  };

  const goBack = () => {
    router.back();
  };

  const renderFieldValue = (field, product) => {
    const fieldValue = product[field.key];
  
    if (field.field_type === 'enum' && Array.isArray(field.options)) {
      const selectedOption = field.options.find(option => option.id == fieldValue);
  
      return selectedOption ? selectedOption.label : 'N/A';
    }
    else if (typeof fieldValue === 'object' && fieldValue !== null) {

      return fieldValue.name ? fieldValue.name : JSON.stringify(fieldValue);
    }

    return fieldValue ? fieldValue.toString() : 'N/A';
  };

  const filteredOtherProducts = otherProducts.filter(product => {
    return Object.entries(filters).every(([filterName, filterValue]) => {
      if (!filterValue) return true; // Skip empty filters
  
      // Find the corresponding field for the filter
      const field = productFields.find(f => f.name === filterName);
      if (!field) return true; // Skip if no matching field is found
  
      let productValue;
      if (field.field_type === 'enum' && field.options) {
        // For enums, find the selected option's label to compare
        const option = field.options.find(option => option.id.toString() === product[field.key]?.toString());
        productValue = option ? option.label.toLowerCase() : '';
      } else {
        // Directly compare string values for other types
        productValue = product[field.key]?.toString().toLowerCase() || '';
      }
  
      return productValue.includes(filterValue.toLowerCase());
    });
  });
  
  const excludedFields = ["Cena", "Jednostka", "Podatek", "Kategoria", "Ceny jednostkowe", "Właściciel", "Aktywne", "Widoczne dla", "Opis"];

  const renderTableHeaders = () => {
    const checkboxHeader = <th key="checkbox-header">Wybierz</th>;
    const fieldHeaders = productFields
    .filter(field => !excludedFields.includes(field.name))
    .map((field, index) => (
      <th key={index}>{field.name}</th>
    ));
  return [checkboxHeader, ...fieldHeaders];
};
  const renderProductRow = (product) => {
    const checkboxColumn = (
      <td key={`checkbox-${product.id}`}>
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={() => handleCheckboxChange(product.id)}
        />
      </td>
    );
    const otherColumns = productFields
    .filter(field => !excludedFields.includes(field.name))
    .map((field, index) => {
      let fieldValue = product[field.key];
      if (field.field_type === 'enum' && fieldValue !== null && fieldValue !== undefined && field.options) {
        const fieldValueStr = String(fieldValue);
        const option = field.options.find(option => String(option.id) === fieldValueStr);
        fieldValue = option ? option.label : 'N/A';
      } else if (typeof fieldValue === 'object' && fieldValue !== null) {
        fieldValue = fieldValue.name ? fieldValue.name : JSON.stringify(fieldValue);
      } else {
        fieldValue = fieldValue || 'N/A';
      }

      return <td key={`${field.key}-${index}`}>{fieldValue}</td>;
    });

  // Return an array that combines the checkbox column with the other columns
  return [checkboxColumn, ...otherColumns];
};

  const applyFilters = (products) => {
    return products.filter(product => {
      return Object.entries(filters).every(([fieldKey, filterValue]) => {
        if (!filterValue) return true; // If no filter value, don't filter out
        
        const field = productFields.find(f => f.key === fieldKey);
        if (!field) return true; // If the field doesn't exist, don't filter out
        
        if (field.field_type === 'enum') {
          // For enums, find the label to match against
          const option = field.options.find(option => option.id.toString() === product[fieldKey].toString());
          return option ? option.label.toLowerCase().includes(filterValue.toLowerCase()) : false;
        } else {
          // For other types, directly compare values
          return product[fieldKey].toString().toLowerCase().includes(filterValue.toLowerCase());
        }
      });
    });
  };
  
  const filteredProducts = applyFilters(otherProducts);

  const typOptions = findFieldOptions('Typ');
  const producentOptions = findFieldOptions('Producent');
  const sterowanieOptions = findFieldOptions('Sterowanie');
  const hierarchiaOptions = findFieldOptions('Hierarchia');
  const firmaOptions = findFieldOptions('Firma');
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
      <>
      <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty w szansie:</h4>
      {dealProducts.length > 0 && (
        <>
          <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty:</h4>
          <ul>
            {dealProducts.map((product, index) => (
              <li key={index} className="mb-1">
                Nazwa: {product.name}, Cena: {product.sum_formatted}
                <p>ID produktu: {product.product_id}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
        <div>
          <input
            type="text"
            placeholder="Filtruj nazwę..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="filter-input m-2"
          />
          <input
            type="text"
            placeholder="Filtruj grupę..."
            value={filters.Grupa}
            onChange={(e) => setFilters({ ...filters, Grupa: e.target.value })}
            className="filter-input m-2"
          />
          <input
            type="text"
            placeholder="Filtruj model..."
            value={filters.Model}
            onChange={(e) => setFilters({ ...filters, Model: e.target.value })}
            className="filter-input m-2"
          />
          <input
            type="text"
            placeholder="Filtruj grupę materiałową..."
            value={filters.GrupaMateriałowa}
            onChange={(e) => setFilters({ ...filters, GrupaMateriałowa: e.target.value })}
            className="filter-input m-2"
          />
          <select
        value={filters.Typ}
        onChange={(e) => setFilters({ ...filters, Typ: e.target.value })}
        className="dropdown m-2"
      >
        <option value="">Filtruj typ...</option>
        {typOptions.map(option => (
          <option key={option.id} value={option.label}>{option.label}</option>
        ))}
      </select>
      <select
        value={filters.Firma}
        onChange={(e) => setFilters({ ...filters, Firma: e.target.value })}
        className="dropdown m-2"
      >
        <option value="">Filtruj firmę...</option>
        {firmaOptions.map(option => (
          <option key={option.id} value={option.label}>{option.label}</option>
        ))}
      </select>
          <input
            type="text"
            placeholder="Filtruj znak..."
            value={filters.Znak}
            onChange={(e) => setFilters({ ...filters, Znak: e.target.value })}
            className="filter-input m-2"
          />
          <select
        value={filters.Producent}
        onChange={(e) => setFilters({ ...filters, Producent: e.target.value })}
        className="dropdown m-2"
      >
        <option value="">Filtruj producenta...</option>
        {producentOptions.map(option => (
          <option key={option.id} value={option.label}>{option.label}</option>
        ))}
      </select>
      <select
        value={filters.Sterowanie}
        onChange={(e) => setFilters({ ...filters, Sterowanie: e.target.value })}
        className="dropdown m-2"
      >
        <option value="">Filtruj sterowanie...</option>
        {sterowanieOptions.map(option => (
          <option key={option.id} value={option.label}>{option.label}</option>
        ))}
      </select>
      <select
        value={filters.Hierarchia}
        onChange={(e) => setFilters({ ...filters, Hierarchia: e.target.value })}
        className="dropdown m-2"
      >
        <option value="">Filtruj hierarchie...</option>
        {hierarchiaOptions.map(option => (
          <option key={option.id} value={option.label}>{option.label}</option>
        ))}
      </select>
        </div>
        <h4 className="text-2xl font-semibold mt-4">Produkty do wyboru:</h4>
      </>
      <div className="l-full">
      <div className="scrollable-container">
      {filteredOtherProducts.length > 0 ? (
        <table className="table-auto w-full mt-2">
          <tbody>
          {filteredOtherProducts.length > 0 && (
        <>
          <table className="table">
        <thead>
          <tr>
            {renderTableHeaders()}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={index}>
              {renderProductRow(product)}
            </tr>
          ))}
        </tbody>
      </table>
        </>
          )}
          </tbody>
        </table>
      ) : (
        <p>Brak produktów spełniających kryteria.</p>
      )}
      </div>
      <div className="fixed-bottom mt-4">
        <button onClick={goBack} className="bg-black m-3 align-right text-white font-bold py-2 px-4 rounded cursor-pointer">Powrót</button>
      </div>
    </div>
    </div>
  );
};

export default AddProduct;
