import { DealsApi, DealFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Update Deal API 📝');

const handler = async (req, res) => {
  try {
    const { id, offerString, uwagiString } = req.body;
    const client = getAPIClient(req, res);
    log.info('Initializing client');
    
    // Initialize APIs
    const dealsApi = new DealsApi(client);
    const dealFieldsApi = new DealFieldsApi(client);

    // Fetch deal fields
    log.info('Fetching deal fields');
    const dealFieldsResponse = await dealFieldsApi.getDealFields({ limit: 500 });
    const dealFields = dealFieldsResponse.data;

    // Find the key for the custom field "OfferExpression"
    const offerExpressionField = dealFields.find(field => field.name === 'OfferExpression');
    if (!offerExpressionField) {
      throw new Error('OfferExpression field not found');
    }

    const uwagiTextField = dealFields.find(field => field.name === 'UwagiText');
    if (!uwagiTextField) {
      throw new Error('uwagiTextField field not found');
    } 

    const offerExpressionKey = offerExpressionField.key;
    const uwagiTextFieldKey = uwagiTextField.key;
    let updateData = null;

    if(uwagiString == null || uwagiString == ''){
      updateData = {
        [offerExpressionKey]: JSON.stringify(offerString),
      };
    } else {
      updateData = {
        [offerExpressionKey]: JSON.stringify(offerString),
        [uwagiTextFieldKey]: JSON.stringify(uwagiString)
      };
    }


    log.info('Updating deal');
    const updatedDeal = await dealsApi.updateDeal(id, updateData);

    const deal = updatedDeal.data;

    log.info('Returning response');
    res.status(200).json(deal);
  } catch (error) {
    log.info('Failed updating deal');
    log.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

export default handler;
