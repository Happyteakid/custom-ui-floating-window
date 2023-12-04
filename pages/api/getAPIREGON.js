import { OrganizationsApi, OrganizationFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
const log = logger('Get API REGON 📚');

/**
 * Obtain the address
 * Return the response
 */
const handler = async (req, res) => {
  try {
    log.info('Starting function');
    const axios = require('axios');

    const xmlBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:web="http://webService/">
        <soapenv:Header/>
        <soapenv:Body>
          <web:YourOperation>
            <!--Optional:-->
            <nip>your-nip-value</nip>
          </web:YourOperation>
        </soapenv:Body>
        </soapenv:Envelope>`;

    axios.post('https://your-soap-api-endpoint', xmlBody, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'your-SOAP-action-if-required'
      }
    })
      .then(response => {
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });



    log.info('Returning response');
    res.status(200).json(organization);
  } catch (error) {
    log.info('Failed getting organizations');
    log.error(error);
    res.status(500).json({ success: false, data: error });
  }
};

export default handler;