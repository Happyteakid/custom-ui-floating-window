import { DealProductsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Post Deal Products API 🛍️');

/**
 * Handler to post deal products to a deal in Pipedrive.
 * Expects the deal ID and product details in the request body.
 */
const handler = async (req, res) => {
  try {
    const { dealId, products } = req.body; // Assuming products is an array of product details
    const client = getAPIClient(req, res);
    log.info('Initializing DealProductsApi client');
    const api = new DealProductsApi(client);

    for (const product of products) {
      log.info(`Adding product to deal ${dealId}: ${product.name}`);
      await api.addDealProduct(dealId, {
        product_id: product.productId,
        quantity: 1,
        price: 1
      });
    }

    log.info('All products added to the deal successfully');
    res.status(200).json({ success: true, message: 'Products added to deal successfully.' });
  } catch (error) {
    log.error('Failed posting deal products', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default handler;
