import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    Grupa: '',
    Model: '',
    GrupaMateriałowa: '',
    Typ: '',
    Firma: '',
    Znak: '',
    Producent: '',
    Sterowanie: ''
  });

  useEffect(() => {

    const fetchProducts = async () => {
      // Fetch deal products
      const dealProductsResponse = await fetch(`/api/getDealProducts?dealId=${dealId}`);
      let productsData = await dealProductsResponse.json();
      // Convert the productsData object into an array if it's not already
      if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
        productsData = Object.values(productsData);
      }

      setDealProducts(productsData);
      
      const otherProductsResponse = await fetch(`/api/getProducts`);
      let otherProductsData = await otherProductsResponse.json();
      /*console.log(otherProductsData);*/
      setOtherProducts(otherProductsData);
      // Fetch product fields
      const productFieldsResponse = await fetch('/api/getProductFields');
      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);
      /*console.log(productFieldsData);*/
    };
  
    if (dealId) {
      fetchProducts();
    }
  }, [dealId]);
  
  const findFieldOptions = (fieldName) => {
    const field = productFields.find(f => f.name === fieldName);
    return field && field.options ? field.options : [];
  };

  const goBack = () => {
    console.log('goBack');
    router.back();
  };

  const renderFieldValue = (field, product) => {
    const fieldValue = product[field.key];
  
    if (field.field_type === 'enum' && Array.isArray(field.options)) {
      const selectedOption = field.options.find(option => option.id == fieldValue);
  
      // Return the label if the selected option is found
      return selectedOption ? selectedOption.label : 'N/A';
    }
    else if (typeof fieldValue === 'object' && fieldValue !== null) {
      // Handle complex object types, adjusting as needed for your data structure
      return fieldValue.name ? fieldValue.name : JSON.stringify(fieldValue);
    }
    // Fallback for direct value rendering
    return fieldValue ? fieldValue.toString() : 'N/A';
  };

  const filteredOtherProducts = otherProducts.filter(product =>
    Object.entries(filters).every(([key, value]) => {

      if (key === 'name' && value) {
        return product.name.toLowerCase().includes(value.toLowerCase());
      }

      const field = productFields.find(f => f.name === key);
      if (!field) return true; // If the field isn't found, don't filter out the product
      const productValue = renderFieldValue(field, product);
      return productValue.toLowerCase().includes(value.toLowerCase());
    })
  );

  const renderProductDetails = (product) => {
    const relevantFields = productFields.filter(field => 
      !["Owner", "Visible to", "Name", "Active", "Category", "Tax","Unit","Price", "Unit prices"].includes(field.name) // Exclude fields by name
    );

    return relevantFields.map(field => {
      const fieldValue = renderFieldValue(field, product);
      return <p key={field.key}>{field.name}: {fieldValue}</p>;
    });
  };

  const typOptions = findFieldOptions('Typ');
  const producentOptions = findFieldOptions('Producent');
  const sterowanieOptions = findFieldOptions('Sterowanie');
  const firmaOptions = findFieldOptions('Firma');
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3>Dodaj produkty do szansy sprzedaży - ID {dealId}</h3>
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
      <>
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
        </div>
        Produkty do wyboru:
      </>
      <ol className="contact-list list-group">
        {filteredOtherProducts.length > 0 ? (
          <ul>
            {filteredOtherProducts.map((product, index) => (
              <li key={index} className="mb-1">
                Nazwa: {product.name}, Cena: {product.prices && product.prices.length > 0 ? `${product.prices[0].price} ${product.prices[0].currency}` : 'Brak ceny'}
                {renderProductDetails(product)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak produktów spełniających kryteria.</p>
        )}
      </ol>
      <div className="fixed-bottom">
        <button onClick={goBack} className="bg-black m-3 align-right text-white font-bold py-2 px-4 rounded cursor-pointer">
          Powrót
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
