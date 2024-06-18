// fetchDealData.js
export const fetchDealDetails = async (id) => {
  const detailsResponse = await fetch(`/api/getDeal?dealId=${id}`);
  const detailsData = await detailsResponse.json();
  const detailsArray = [
    { label: 'ID', value: detailsData.id },
    { label: 'ID lejka', value: detailsData.pipeline_id },
    { label: 'Wartość', value: detailsData.formatted_value },
    { label: 'Nazwa organizacji', value: detailsData.org_id.name },
    { label: 'Adres organizacji', value: detailsData.org_id.address }
  ];
  // Fetch deals fields
  const dealFieldResponse = await fetch(`/api/getDealFields`);
  const dealsFieldData = await dealFieldResponse.json();
  console.log(dealsFieldData);
  const offerExpressionField = dealsFieldData.find(field => field.name === 'OfferExpression');
  if (!offerExpressionField) {
    throw new Error('OfferExpression field not found');
  }
  console.log("offerExpressionField: ",offerExpressionField.key);
  const offerList = detailsData[offerExpressionField.key];
  const offerListArray = JSON.parse(offerList || '[]');
  return {detailsArray, offerListArray};
};

export const fetchDealProducts = async (id) => {
  const productsResponse = await fetch(`/api/getDealProducts?dealId=${id}`);
  let productsData = await productsResponse.json();

  if (productsData && typeof productsData === 'object' && !Array.isArray(productsData)) {
    productsData = Object.values(productsData);
  }
  
  const productIds = productsData.map(product => product.product_id);
  const pricesResponse = await fetch('/api/getProduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productIds })
  });
  const pricesData = await pricesResponse.json();

  const productsWithPrices = productsData.map(product => {
    const priceInfo = pricesData.find(price => price.id === product.product_id) || {};
    return {
      ...product,
      price: priceInfo.price,
      currency: priceInfo.currency
    };
  });

  const totalFetchedSum = productsWithPrices.reduce((acc, product) => acc + (product.price || 0), 0);
  const totalItemSum = productsData.reduce((acc, product) => acc + (product.sum || 0), 0);
  const percentageDiff = ((totalFetchedSum - totalItemSum) / totalFetchedSum) * 100;

  
  return { productsWithPrices, totalFetchedSum, percentageDiff };
};
