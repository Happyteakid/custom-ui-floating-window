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
    const xml2js = require('xml2js');
    const gusToken = process.env.API_REGON;
    const url = 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';
    let sid = '';

    var xmlBody =
      '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://CIS/BIR/PUBL/2014/07">' +
      '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
      '<wsa:To>https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc</wsa:To>' +
      '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj</wsa:Action>' +
      '</soap:Header>' +
      '<soap:Body>' +
      '<ns:Zaloguj>' +
      '<ns:pKluczUzytkownika>' + gusToken + '</ns:pKluczUzytkownika>' +
      '</ns:Zaloguj>' +
      '</soap:Body>' +
      '</soap:Envelope>';

    log.info('gus token: ' + gusToken);
    log.info(xmlBody);
    axios.post(url, xmlBody, {
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8'
      }
    })
    .then(response => {
      console.log('==============');
      console.log(response);
      // Split the response by the boundary
      const boundary = response.headers['content-type'].split('boundary=')[1];
      if (boundary) {
        const parts = response.data.split('--' + boundary);
        // Find the part that is XML
        const xmlPart = parts.find(part => part.includes('application/xop+xml'));
        if (xmlPart) {
          // Extract and trim the XML content
          const xmlContent = xmlPart.split('type="application/soap+xml"')[1].trim();
          // Now parse the XML content
          xml2js.parseString(xmlContent, (err, result) => {
            if (err) {
              throw err;
            }
            // Process the parsed XML
            log.info('sid: '+ result);
            log.info(result);
          });
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  


  //////////////// SECOND POST - GET ORG FROM API REGON ///////////////
  /*
  let xmlRequest =
    '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://CIS/BIR/PUBL/2014/07" xmlns:dat="http://CIS/BIR/PUBL/2014/07/DataContract">' +
    '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">' +
    '<wsa:To>https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc</wsa:To>' +
    '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty</wsa:Action>' +
    '</soap:Header>' +
    ' <soap:Body>' +
    ' <ns:DaneSzukajPodmioty>' +
    ' <ns:pParametryWyszukiwania>' +
    ' <dat:Nip>' + '5860062842' + '</dat:Nip> ' +
    ' </ns:pParametryWyszukiwania>' +
    ' </ns:DaneSzukajPodmioty>' +
    ' </soap:Body>' +
    '</soap:Envelope>';


  axios.post(url, xmlRequest, {
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8',
      'sid': sid
    }
  })
    .then(response => {
      console.log('DaneSzukajPodmioty Response:'+ response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

*/
  log.info('Returning response');
  res.status(200).json(null);
} catch (error) {
  log.error(error);
  res.status(500).json({ success: false, data: error });
}
};

export default handler;