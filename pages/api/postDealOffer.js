import { DealsApi, DealFieldsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Update Deal Offer API 📝');

const handler = async (req, res) => {
  try {
    const offer = req.body;
    const client = getAPIClient(req, res);
    log.info('Initializing client');

    // Get deal fields
    const dealFieldsApi = new DealFieldsApi(client);
    const dealFieldsResponse = await dealFieldsApi.getDealFields({ limit: 500 });
    const dealFields = dealFieldsResponse.data;

    // Find the key for the custom field "OfferExpression"
    const offerExpressionField = dealFields.find(field => field.name === 'OfferExpression');
    if (!offerExpressionField) {
      throw new Error('OfferExpression field not found');
    }

    const offerExpressionKey = offerExpressionField.key;

    // Get the current deal
    const dealsApi = new DealsApi(client);
    const currentDealResponse = await dealsApi.getDeal(offer.id);
    const currentDeal = currentDealResponse.data;

    // Get the current OfferExpression value
    let currentOffers = [];
    if (currentDeal[offerExpressionKey]) {
      currentOffers = JSON.parse(currentDeal[offerExpressionKey]);
    }

    const nextOId = currentOffers.length ? Math.max(...currentOffers.map(o => o.o_id || 0)) + 1 : 1;

    // Append the new offer with the o_id
    currentOffers.push({
      ...JSON.parse(offer.offerString),
      o_id: nextOId
    });

    // Update the deal
    log.info('Request body: ', offer);
    const updatedDeal = await dealsApi.updateDeal(offer.id, {
      [offerExpressionKey]: JSON.stringify(currentOffers)
    });

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
