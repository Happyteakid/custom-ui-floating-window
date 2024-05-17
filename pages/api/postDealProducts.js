import logger from '../../shared/logger';
import fetch from 'node-fetch';
import { getAPIClient } from '../../shared/oauth';
import { DealsApi } from 'pipedrive';

const log = logger('Post Deal Products API 🛍️');


const handler = async (req, res) => {
  try {
    const client = getAPIClient(req, res);
    let { dealId, productId, productPrice, comment, discount } = req.body;
    const API_TOKEN = process.env.PIPEDRIVE_TOKEN;
    
    log.info(req.body);
    const BASE_URL = 'https://natalia-sandbox3.pipedrive.com/api/v1';
    log.info(`${BASE_URL}/deals/${dealId}/products?api_token=${API_TOKEN}`)

    const response = await fetch(`${BASE_URL}/deals/${dealId}/products?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "product_id": productId,
        "item_price": productPrice || 0,
        "quantity": 1,
        "comment": comment || null,
        "discount": discount || 0
      }),
    });

    if (!response.ok) {
      //throw new Error(`Failed to add product ${productId} to deal ${dealId}`);
      throw new Error(response.statusText + ': ' + response.status + ': ' + response.body);
    }

    log.info(`Product ${productId} added to deal ${dealId}`);
    

    res.status(200).json({ success: true, message: 'All products added to the deal successfully.' });
  } catch (error) {
    log.error('Failed posting deal products', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default handler;
