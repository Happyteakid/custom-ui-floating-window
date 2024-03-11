import { DealsApi, DealFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
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

      log.info('Getting all deals');
      const contactObj = await api.getDeals();
      
      
      const api2 = new DealFieldsApi(client);

      const deal = contactObj.data;
      
      log.info('Returning response');
      res.status(200).json(deal);
    } catch (error) {
      log.info('Failed getting deals');
      log.error(error);
      res.status(500).json({ success: false, data: error });
    }
  };

export default handler;