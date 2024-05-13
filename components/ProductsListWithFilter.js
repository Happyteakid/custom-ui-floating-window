import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const ProductsListWithFilter = ({ products, selectedProducts, onSelectionChange, filterHierarchy, company, productEnums }) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(3);
    const [rowsOptions, setRowsOptions] = useState([
        { label: '3', value: 3 },
        { label: '5', value: 5 },
        { label: '10', value: 10 }
      ]);
      console.log('productEnums:', productEnums);

      const filteredProducts = useMemo(() => {
        let filtered = products;
        if (company) {
            filtered = filtered.filter(product => product.Firma === company);
        }

        if (globalFilterValue) {
            filtered = filtered.filter(product => product.name.toLowerCase().includes(globalFilterValue.toLowerCase()));
        }

        return filtered;
      }, [products, company, globalFilterValue])

    const columnFields = useMemo(() => {
        if (products.length > 0) {
            return Object.keys(products[0]).filter(key =>
                !['active_flag', 'prices', 'product_variations', 'owner_id','prices', 'selectable','Aktywne', 'Produkt kompatybilny z', 'files_count', 'add_time','Cykle rozliczeniowe', 'Hierarchia', 'visible_to', 'first_char', 'Częstotliwość rozliczeń','Widoczne dla', 'update_time', 'Podatek', 'Kategoria', 'Właściciel'].includes(key));
        }
        return [];
    }, [products]);

    const filters = useMemo(() => {
        const initialFilters = {};
        columnFields.forEach(field => {
            initialFilters[field] = { value: null, matchMode: 'contains' };
        });
        return initialFilters;
    }, [columnFields]);

    const priceBodyTemplate = (rowData) => {
        return rowData.prices && rowData.prices.length > 0
            ? `${rowData.prices[0].price} ${rowData.prices[0].currency}`
            : 'N/A';
    };

    if (products.length === 0) return null;

    return (
        <div>
            <div className='flex'>
                <h4 className="text-2xl font-semibold mt-4 mb-2">Produkty w ofercie:</h4>
            </div>
            <DataTable
                value={filteredProducts}
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Wyświetlam {first} do {last} z {totalRecords} wpisów"
                rows={rows}
                first={first}
                onPage={(e) => {
                    setFirst(e.first);
                    setRows(e.rows);
                }}
                selection={selectedProducts}
                onSelectionChange={(e) => onSelectionChange(e.value)}
                dataKey="ID"
                style={{ maxWidth: '100%' }}
                filters={filters}
                filterDisplay="menu"
                globalFilter={globalFilterValue}
                header={<div>
                    <Dropdown className=''
                        value={rows} 
                        options={rowsOptions} 
                        onChange={(e) => setRows(e.value)} 
                        placeholder="Row count"
                        style={{ width: 'auto' }}
                        
                    />
                        <InputText className='ml-2' type="search" onInput={(e) => setGlobalFilterValue(e.target.value)} placeholder="Globalne wyszukiwanie" />
                </div>}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                {columnFields.map((field) => (
                    <Column
                        key={field}
                        field={field}
                        header={field.charAt(0).toUpperCase() + field.slice(1)}
                        filter
                        filterMatchMode="contains"
                    />
                ))}
                <Column field="price" header="Price" body={priceBodyTemplate} />
            </DataTable>
        </div>
    );
};

export default ProductsListWithFilter;