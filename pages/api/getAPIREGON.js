import { OrganizationsApi, OrganizationFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';
import { getCookie } from 'cookies-next';
//import {Client} from 'node-regon';
const log = logger('Get API REGON 📚');
const Client = require('node-regon');

/**
 * Obtain the address
 * Return the response
 */
const handler = async (req, res) => {
  try {
    log.info('Starting function');
    log.info('Nip: ' + req.body.nip);

    
    const gusToken = process.env.API_REGON;

    let gus = await Client.createClient({
      key: gusToken,
      birVersion: '1.1',
      sandbox: false
    });

    log.info(gus);

      console.log("login GUS sessionID: ", gus.getSessionId());
      gus.findByNip(req.body.nip).then(async function(findCompanyByNip) {
        console.log('findCompanyByNip: ', findCompanyByNip);
          var companyRegon = findCompanyByNip.Regon; // get regon from previous query
          await gus.getFullReport(companyRegon, findCompanyByNip.Typ, findCompanyByNip.SilosID).then(function(fullReport) {
            //console.log('Company Regon: ', companyRegon);
            //  console.log('fullReport: ', fullReport);
              let extractedData = {
                nazwa: findCompanyByNip.Nazwa[0],
                kodPocztowy: findCompanyByNip.KodPocztowy[0],
                miejscowosc: findCompanyByNip.Miejscowosc[0],
                ulica: findCompanyByNip.Ulica[0],
                nrNieruchomosci: findCompanyByNip.NrNieruchomosci[0],
                nrLokalu: findCompanyByNip.NrLokalu[0]
              };
              let jsonString = JSON.stringify(extractedData);
              console.log(jsonString);
              res.status(200).json(jsonString);
              gus.logout();
          });
  
      });


  } catch (error) {
    log.error(error);
  res.status(500).json({ success: false, data: error });
  }
}

export default handler;