import logger from '../../shared/logger';
import fetch from 'node-fetch';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Update Deal Products API 🛍️');

const handler = async (req, res) => {
  try {
    let { dealId, productId, itemPrice, comments, discount } = req.body;
    const API_TOKEN = process.env.PIPEDRIVE_TOKEN;

    log.info(req.body);

    const BASE_URL = 'https://natalia-sandbox3.pipedrive.com/api/v1';
    const updateURL = `${BASE_URL}/deals/${dealId}/products/${productId}/?api_token=${API_TOKEN}`;

    log.info(updateURL);

    const response = await fetch(updateURL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "item_price": parseInt(itemPrice) || 0,
        "comments": comments || null,
        "discount": parseInt(discount) || 0
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Failed to update product ${productId} in deal ${dealId}: ${response.statusText} - ${JSON.stringify(errorDetails)}`);
    }

    log.info(`Product ${productId} updated in deal ${dealId}`);
    res.status(200).json({ success: true, message: 'Product updated in the deal successfully.' });
  } catch (error) {
    log.error('Failed updating deal products', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default handler;
