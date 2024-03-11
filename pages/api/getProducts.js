import { ProductsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
const log = logger('Get Products API 📚');
/**
 * Gets a list of products in Pipedrive for the ProductList page
 */
const handler = async (req, res) => {
  try {
    log.info('Getting session details');
    const client = getAPIClient(req, res);
    log.info('Initializing product');
    const api = new ProductsApi(client);

    log.info('Getting all products');
    const productObj = await api.getProducts();
    const products = productObj.data;

    log.info('Returning response');
    res.status(200).json(products);
  } catch (error) {
    log.info('Failed getting products');
    log.error(error);
    res.status(500).json({ success: false, data: error });
  }
};

export default handler;
