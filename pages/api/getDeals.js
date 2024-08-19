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
    const limit = 500;

    log.info('Getting all deals');
    while (moreItems) {
      const response = await api.getDeals({
        limit: limit,
        start: start,
      });

      const deals = response.data; 
      if (deals.length > 0) {
        allDeals = allDeals.concat(deals);

        if (deals.length < limit) {
          moreItems = false;
        } else {
          start += limit;
        }
      } else {
        moreItems = false;
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
