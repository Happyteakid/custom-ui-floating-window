import { DealsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Deal Products API 📚');

/**
 * Gets a list of products associated with a deal in Pipedrive for the DealProducts page
 */
const handler = async (req, res) => {
  try {
    // Extract the deal ID from the request query or parameters
    const { dealId } = req.query;

    if (!dealId) {
      return res.status(400).json({ success: false, message: "Deal ID is required" });
    }

    log.info('Getting session details');
    const client = getAPIClient(req, res);
    log.info(`Initializing deal products for deal ID: ${dealId}`);
    const api = new DealsApi(client);

    log.info(`Getting all products for deal ID: ${dealId}`);
    // Use getDealProducts function from DealsApi and pass the dealId to it
    const response = await api.getDealProducts(dealId, {});
    const dealProducts = response.data;

    log.info('Returning response');
    res.status(200).json(dealProducts);
  } catch (error) {
    log.info(`Failed getting products for deal ID: ${req.query.dealId}`);
    log.error(error);
    res.status(500).json({ success: false, data: error });
  }
};

export default handler;
