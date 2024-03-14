import { DealsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Deals API 📚');

/**
 * Get the current session
 * Obtain the deals by ID
 * Return the response
 */

const handler = async (req, res) => {
  try {
    const client = getAPIClient(req, res);
    log.info('Initializing client');
    const api = new DealsApi(client);
    let allDeals = [];
    let moreItems = true;
    let start = 0;
    const limit = 100; // Adjust based on API capabilities

    log.info('Getting all deals');
    while (moreItems) {
      // Adjust this call based on the actual method signature and parameters
      const response = await api.getDeals({
        limit: limit,
        start: start,
        // include additional parameters here as needed
      });

      const deals = response.data; // Adjust based on actual response structure
      if (deals.length > 0) {
        allDeals = allDeals.concat(deals);

        if (deals.length < limit) {
          moreItems = false; // Exit loop if last page
        } else {
          start += limit; // Prepare for next page
        }
      } else {
        moreItems = false; // Exit loop if no deals
      }
    }

    log.info('Returning response');
    res.status(200).json(allDeals);
  } catch (error) {
    log.info('Failed getting deals');
    log.error(error);
    res.status(500).json({ success: false, data: error });
  }
};

export default handler;
