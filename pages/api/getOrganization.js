import { OrganizationsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
const log = logger('Get Organization API 📚');

/**
 * Get the current session
 * Obtain the organizations by ID / NIP
 * Return the response
 */

  const handler = async (req, res) => {
    try {
      log.info('Getting session details');
      /*const session = getCookie('session', req);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }*/

      const client = getAPIClient(req, res);
      log.info('Initializing client');
      const api = new OrganizationsApi(client);

      log.info('Getting all organizations');
      const contactObj = await api.getOrganizations();
      
      const organization = contactObj.data;
      
      log.info('Returning response');
      res.status(200).json(organization);
    } catch (error) {
      log.info('Failed getting contacts');
      log.error(error);
      res.status(500).json({ success: false, data: error });
    }
  };

export default handler;