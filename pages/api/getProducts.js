import { ProductsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Products API 📚');

/**
 * Gets a list of all products in Pipedrive for the ProductList page
 */
const handler = async (req, res) => {
  try {
    log.info('Getting session details');
    const client = getAPIClient(req, res);
    const api = new ProductsApi(client);

    let allProducts = [];
    let moreItems = true;
    let start = 0;
    const limit = 500;

    log.info('Getting all products');
    while (moreItems) {
      const response = await api.getProducts({
        limit: limit, //TODO hardcoded limit {limit}
        start: start,
      });

      if (response.data && response.data.length > 0) {
        allProducts = allProducts.concat(response.data);
        start += response.data.length;

        if (response.data.length < limit) {
          moreItems = false;
        }
      } else {
        moreItems = false;
      }
    }

    log.info('Returning response with all products');
    res.status(200).json(allProducts);
  } catch (error) {
    log.info('Failed getting products');
    log.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;
