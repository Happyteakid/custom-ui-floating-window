import { DealsApi } from 'pipedrive';
import logger from '../../shared/logger';
import { getAPIClient } from '../../shared/oauth';

const log = logger('Update Deal API 📝');
//3e4d581903c274d0b40695f7341245f6c2716c88 = Umożliwienie tworzenia ofert
//6495917a3d232c7f10b4dbfc7c828a0f29f16eb9 = Status wniosku
/**
 * Update the deal in Pipedrive
 * Return the response
 */
const handler = async (req, res) => {
  try {
    const d = req.body;
    const client = getAPIClient(req, res);
    log.info('Initializing client');
    const dealsApi = new DealsApi(client);

    log.info('Updating deal');
    const updatedDeal = await dealsApi.updateDeal(
      d.id,
      {
        "3e4d581903c274d0b40695f7341245f6c2716c88": d.accrej,
        "6495917a3d232c7f10b4dbfc7c828a0f29f16eb9": d.yesno
      }
    );

    const deal = updatedDeal.data;
    
    log.info('Returning response');
    res.status(200).json(deal);
  } catch (error) {
    log.info('Failed updating deal');
    log.error(error);
    res.status(500).json({ success: false, data: error });
  }
};

export default handler;
