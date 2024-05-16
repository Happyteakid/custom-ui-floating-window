import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from 'primereact/dropdown';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { SelectButton } from 'primereact/selectbutton';
import DealProductsList from '../../components/DealProductsList';
import ProductsListWithFilter from '../../components/ProductsListWithFilter';
import EnumDropdown from '../../components/EnumDropdown';
import GoBackButton from '../../components/GoBackButton';
import { Button } from 'primereact/button';

const AddProduct = () => {
  const router = useRouter();
  const { dealId } = router.query;
  const [dealProducts, setDealProducts] = useState([]);
  const [otherProducts, setOtherProducts] = useState([]);
  const [productFields, setProductFields] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [hierarchy, setHierarchy] = useState('196');
  const [filterHierarchy, setFilterHierarchy] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProducent, setSelectedProducent] = useState(null);
  const [selectedSterowanie, setSelectedSterowanie] = useState(null);
  const [selectedGrupa, setSelectedGrupa] = useState(null);
  const [loading, setLoading] = useState(true);
  var productFieldsData;

  const [companyOptions] = useState([
    { label: 'HTM', value: 'HTM' },
    { label: 'NTM', value: 'NTM' }
  ]);
  const [grupaMateriałowaOptions] = useState([
    { label: 'Obrabiarki', value: 'Obrabiarki' },
    { label: 'Wypos. obrabiarek', value: 'Wypos. obrabiarek' }
  ]);
  const [grupaMateriałowa, setGrupaMateriałowa] = useState();
  const [company, setCompany] = useState();
  const [isCreating, setIsCreating] = useState(false);

  const [placeholderOptions] = useState([
    { name: 'Centrum tokarskie', code: 'NY' },
    { name: 'Centrum wielozadaniowe', code: 'RM' },
    { name: 'Centrum obróbkowe', code: 'LDN' },
    { name: 'Centrum bramowe', code: 'IST' },
    { name: 'Centrum szlifierskie', code: 'PRS' }
  ]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState(null);

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

  const fetchProductsAndFields = async () => {
    try {
      await fetchDealProducts();

      const otherProductsResponse = await fetch(`/api/getProducts`);
      if (!otherProductsResponse.ok) {
        throw new Error(`Failed to fetch products list: ${otherProductsResponse.statusText}`);
      }

      let otherProductsData = await otherProductsResponse.json();

      const productFieldsResponse = await fetch('/api/getProductFields');
      if (!productFieldsResponse.ok) {
        throw new Error(`Failed to fetch product fields: ${productFieldsResponse.statusText}`);
      }

      const productFieldsData = await productFieldsResponse.json();
      setProductFields(productFieldsData);
      console.log('productFieldsData: ', productFieldsData);

      // Update otherProducts with correct values for enums
      const updatedOtherProductsData = updateProductsWithFieldValues(otherProductsData, productFieldsData);
      console.log('UpdatedOtherProductsData: ', updatedOtherProductsData);

      setOtherProducts(updatedOtherProductsData);
    } catch (error) {
      console.error('Error fetching products and fields:', error);
    } finally {
      setLoading(false);
    }
  };

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

      // Fetch updated deal products after adding new products
      await fetchDealProducts();

    } catch (error) {
      console.error('Error posting deal products:', error);
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (dealId) {
      fetchProductsAndFields();
    }
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
    console.log('products: ', products);
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
          company={company}
          productEnums={productFieldsData}
          onSelectionChange={setSelectedProducts}
          selectedType={selectedType}
          selectedProducent={selectedProducent}
          selectedSterowanie={selectedSterowanie}
          selectedGrupa={selectedGrupa}
          grupaMateriałowa={grupaMateriałowa}
        />
        <GoBackButton />
      </div>
    </div>
  );
};

export default AddProduct;
