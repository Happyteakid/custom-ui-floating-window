import { DealsApi, DealFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Update Deal API 📝');

/**
 * Update the deal in Pipedrive
 * Return the response
 */
const handler = async (req, res) => {
  try {
    const d = req.body;
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

    const offerExpressionKey = offerExpressionField.key;

    // Prepare the update data
    const updateData = {
      [offerExpressionKey]: JSON.stringify(d.offerString)
    };

    log.info('Updating deal');
    const updatedDeal = await dealsApi.updateDeal(d.id, updateData);

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
