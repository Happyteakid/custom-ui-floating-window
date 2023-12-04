import { OrganizationsApi, OrganizationFieldsApi, NewOrganization } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
const log = logger('Get Organization API 📚');

/**
 * Get the current session
 * Post the organization to Pipedrive
 * Return the response
 */
  const handler = async (req, res) => {
    try {
      const d = req.body;
      const client = getAPIClient(req, res);
      log.info('Initializing client');
      const api = new OrganizationsApi(client);
     

      log.info('Posting organization');
      const newOrganization = await api.addOrganization(
        NewOrganization.constructFromObject({
          name: d.name,
          address: d.address,
          nip: d.nip,
        })
      );

      const organization = newOrganization.data;
      
      log.info('Returning response');
      res.status(200).json(organization);
    } catch (error) {
      log.info('Failed posting organization');
      log.error(error);
      res.status(500).json({ success: false, data: error });
    }
  };

export default handler;