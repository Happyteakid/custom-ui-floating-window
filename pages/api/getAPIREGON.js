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
          var companyRegon = findCompanyByNip.Regon; // get regon from previous query
          await gus.getFullReport(companyRegon, findCompanyByNip.Typ, findCompanyByNip.SilosID).then(function(fullReport) {
            console.log('Company Regon: ', companyRegon);
              console.log('fullReport: ', fullReport);
              let extractedData = {
                praw_nazwa: fullReport.praw_nazwa[0],
                praw_adSiedzKodPocztowy: fullReport.praw_adSiedzKodPocztowy[0],
                praw_adSiedzMiejscowosc_Nazwa: fullReport.praw_adSiedzMiejscowosc_Nazwa[0]
              };
              let jsonString = JSON.stringify(extractedData);
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