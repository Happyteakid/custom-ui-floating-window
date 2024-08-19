import { DealsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Deal API 📚');

/**
 * Get the current session
 * Obtain the deal by ID
 * Return the response
 */
const handler = async (req, res) => {
  try {
    const { dealId } = req.query;

    if (!dealId) {
      return res.status(400).json({ success: false, data: 'No deal ID provided' });
    }

    const client = getAPIClient(req, res);
    log.info('Initializing client');
    const api = new DealsApi(client);

    log.info(`Fetching deal with ID: ${dealId}`);
    const response = await api.getDeal(dealId);

    if (response.data) {
      log.info('Returning deal response');
      res.status(200).json(response.data);
    } else {
      log.info('No deal found');
      res.status(404).json({ success: false, data: 'No deal found with provided ID' });
    }
  } catch (error) {
    log.error('Failed getting deal', error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;