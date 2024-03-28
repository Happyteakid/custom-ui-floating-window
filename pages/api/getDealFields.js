import { DealFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Get Deal Fields API 📚');

/**
 * Gets a list of deal fields in Pipedrive
 */
const handler = async (req, res) => {
  try {
    log.info('Getting session details');
    const client = getAPIClient(req, res);
    log.info('Initializing deal fields');
    const api = new DealFieldsApi(client);
    const limit = 500;

    log.info('Getting all deal fields');
    const response = await api.getDealFields({
      limit: limit
    });
    const dealFields = response.data;

    log.info('Returning response with all deal fields');
    res.status(200).json(dealFields);
  } catch (error) {
    log.info('Failed getting deal fields');
    log.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;
