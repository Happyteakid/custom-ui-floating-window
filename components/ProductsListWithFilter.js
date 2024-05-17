import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { Dropdown } from 'primereact/dropdown';

const ProductsListWithFilter = ({ products, selectedProducts, onSelectionChange, filterHierarchy, company, productEnums, selectedType, selectedProducent, selectedSterowanie, selectedGrupa, grupaMateriałowa }) => {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(3);
    const [rowsOptions] = useState([
        { label: '3', value: 3 },
        { label: '5', value: 5 },
        { label: '10', value: 10 }
    ]);

    const filteredProducts = useMemo(() => {
        console.log('ProductsListWithFilter selectedGrupa ', selectedGrupa);
        let filtered = products;
        if (selectedType) {
            filtered = filtered.filter(product => product.Typ === selectedType);
        }
        if (selectedProducent) {
            filtered = filtered.filter(product => product.Producent === selectedProducent);
        }
        if (selectedSterowanie) {
            filtered = filtered.filter(product => product.Sterowanie === selectedSterowanie);
        }
        if (selectedGrupa) {
            filtered = filtered.filter(product => product.Grupa === selectedGrupa);
        }
        if (company) {
            filtered = filtered.filter(product => product.Firma === company);
        }
        if (grupaMateriałowa) {
            filtered = filtered.filter(product => product["Grupa materiałowa"] === grupaMateriałowa);
            const firstFewEntries = filtered.slice(0, 10);
            firstFewEntries.forEach(product => {
                console.log('Filtered result: ', product["Grupa materiałowa"]); // Should log the property value for the first 10 products
            });
            console.log('ProductsListWithFilter grupaMateriałowa', grupaMateriałowa);
        }
        return filtered;
    }, [products, company, selectedType, selectedProducent, selectedSterowanie, selectedGrupa, grupaMateriałowa]);

    const columnFields = useMemo(() => {
        if (products.length > 0) {
            return Object.keys(products[0]).filter(key =>
                !['active_flag', 'product_variations', 'owner_id', 'prices', 'Price','price', 'selectable', "Jednostka", 'Aktywne', 'Produkt kompatybilny z', 'files_count', 'add_time', 'Cykle rozliczeniowe', 'Hierarchia', 'visible_to', 'first_char', 'Częstotliwość rozliczeń', 'Widoczne dla', 'update_time', 'Podatek', 'Kategoria', 'Właściciel'].includes(key));
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
                header={<div>
                    <Dropdown className=''
                        value={rows} 
                        options={rowsOptions} 
                        onChange={(e) => setRows(e.value)} 
                        placeholder="Row count"
                        style={{ width: 'auto' }}
                    />
                </div>}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                {columnFields.map((field) => (
                    <Column
                        key={field}
                        field={field}
                        header={field.charAt(0).toUpperCase() + field.slice(1)}
                        filter
                        sortable
                        filterMatchMode="contains"
                    />
                ))}
                <Column field="price" header="Price" body={priceBodyTemplate} />
            </DataTable>
        </div>
    );
};

export default ProductsListWithFilter;
