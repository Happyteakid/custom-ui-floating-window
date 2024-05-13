import logger from '../../shared/logger';
import fetch from 'node-fetch';

const log = logger('Delete Deal Products API 🛍️');

const handler = async (req, res) => {
  try {
    const { dealId, product_attachment_id } = req.body;
    const API_TOKEN = process.env.PIPEDRIVE_TOKEN;
    const BASE_URL = 'https://natalia-sandbox3.pipedrive.com/api/v1';

    log.info(`Attempting to delete: ${BASE_URL}/deals/${dealId}/products/${product_attachment_id}?api_token=...`);

    const response = await fetch(`${BASE_URL}/deals/${dealId}/products/${product_attachment_id}?api_token=${API_TOKEN}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`${response.statusText}: ${response.status}`);
    }

    log.info(`Product ${product_attachment_id} deleted from deal ${dealId}`);
    res.status(200).json({ success: true, message: 'Product deleted from the deal successfully.' });
  } catch (error) {
    log.error('Failed deleting deal products', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default handler;