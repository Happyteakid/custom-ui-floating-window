import { OrganizationsApi, OrganizationFieldsApi } from 'pipedrive';
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

      const client = getAPIClient(req, res);
      log.info('Initializing client');
      const api = new OrganizationsApi(client);

      log.info('Getting all organizations');
      const contactObj = await api.getOrganizations();
      
      
      const api2 = new OrganizationFieldsApi(client);
      //log.info('Works');
      //const contactObj2 = await api2.OrganizationFieldsApi();

      //log.info(contactObj2.data);

      const organization = contactObj.data;
      
      log.info('Returning response');
      res.status(200).json(organization);
    } catch (error) {
      log.info('Failed getting organizations');
      log.error(error);
      res.status(500).json({ success: false, data: error });
    }
  };

export default handler;