import { ProductFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Product Fields API 📚');

/**
 * Gets a list of product fields in Pipedrive for the ProductFields page
 */
const handler = async (req, res) => {
  try {
    log.info('Getting session details');
    const client = getAPIClient(req, res);
    log.info('Initializing product fields');
    const api = new ProductFieldsApi(client);

    log.info('Getting all product fields');
    const response = await api.getProductFields({});
    const productFields = response.data;

    log.info('Returning response with all product fields');
    res.status(200).json(productFields);
  } catch (error) {
    log.info('Failed getting product fields');
    log.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;
