import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';

const EnumDropdown = (enumName, productFieldsData) => {
  const router = useRouter();
  const { dealId } = router.query;
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const typField = productFieldsData.find(field => field.name == enumName);
  if (typField && typField.options) {
    setProductTypes(typField.options.map(option => ({ label: option.label, value: option.id })));
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3>Szansy sprzedaży - ID {dealId}</h3>
      <div className="flex justify-content-center m-3">
        <Dropdown
          value={selectedType}
          options={productTypes}
          onChange={(e) => setSelectedType(e.value)}
          placeholder="Select a Type"
          showClear
        />
      </div>
    </div>
  );
};

export default EnumDropdown;
