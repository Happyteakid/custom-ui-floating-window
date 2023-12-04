import { OrganizationsApi, OrganizationFieldsApi, NewOrganization } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
const log = logger('Get Organization API 📚');

//SANDBOX API KEY FOR ORGANIZATION 7b4ee6ab150271090998e28fcdf397f97b842435

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
     //log.info(req.body);
     //log.info(req.body.name);
     //log.info(req.body["7b4ee6ab150271090998e28fcdf397f97b842435"]);
     //log.info(req.body.nip);

      log.info('Posting organization');
      const newOrganization = await api.addOrganization(
        NewOrganization.constructFromObject({
          name: d.name,
          address: d.address,
          "7b4ee6ab150271090998e28fcdf397f97b842435": d["7b4ee6ab150271090998e28fcdf397f97b842435"],
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