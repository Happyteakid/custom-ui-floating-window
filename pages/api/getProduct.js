import { ProductsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Product API 📚');

/**
 * Gets a specific product in Pipedrive based on the id
 */
const handler = async (req, res) => {
  try {
    log.info('Getting session details');
    const client = getAPIClient(req, res);
    const api = new ProductsApi(client);

    const { productIds } = req.body; // Assuming product IDs are passed in the request body
    log.info(`Getting products with ids: ${productIds}`);

    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await api.getProduct(id);
        return {
          id: product.data.id,
          name: product.data.name,
          price: product.data.prices[0]?.price || null, // Extracting the first price
          currency: product.data.prices[0]?.currency || null,
        };
      })
    );

    log.info('Returning response with all products');
    res.status(200).json(products);
  } catch (error) {
    log.info('Failed getting products');
    log.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;
