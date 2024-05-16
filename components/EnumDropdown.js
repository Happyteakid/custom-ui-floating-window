import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';

const EnumDropdown = ({ enumName, productFieldsData, placeholderText, onChange }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    console.log('EnumDropdown:', productFieldsData, 'enumName:', enumName);
    if (productFieldsData && productFieldsData.length) {
      const typField = productFieldsData.find(field => field.name == enumName);
      if (typField && typField.options) {
        setProductTypes(typField.options.map(option => ({
          label: option.label,
          value: option.label
        })));
      }
    }
  }, [enumName, productFieldsData]);
  
  const handleChange = (e) => {
    if(enumName = 'Typ'){
      setSelectedType(e.value);
    }
    if(enumName == 'Producent'){
      setProducent(e.value);
    }
    if(enumName == 'Sterowanie'){
    setSterowanie(e.value);
    }
    if(enumName == 'Grupa'){
      setSelectedGrupa(e.value);
    }
    
    onChange(e.value);
    console.log('Dropdown handle change:', e.value);
  };

  return (
    <Dropdown
      value={selectedType}
      options={productTypes}
      onChange={handleChange}
      placeholder={placeholderText}
      className='custom-dropdown m-3'
      showClear
      filter
    />
  );
};

export default EnumDropdown;
