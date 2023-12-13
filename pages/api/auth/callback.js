import db from '../../../shared/db';
import {
  initAPIClient,
  getLoggedInUser,
  updateTokens,
} from '../../../shared/oauth';

// Redirect the user to the authorization URL generated by the client
const handler = async (req, res) => {
  try {
    const { code } = req.query;
    // Get the access token
    const client = initAPIClient({});
    const token = await client.authorize(code);
    updateTokens(client, token);
    // Get the currently logged in user
    const user = await getLoggedInUser(client);
    const me = user.data;
    // Persist this information
    const credentials = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: String(Date.now() + token.expires_in * 2500),
    };
    await db.user.upsert({
      where: {
        accountId: String(me.id),
      },
      update: credentials,
      create: {
        accountId: String(me.id),
        name: me.name, // Can lookup via users/me for more info
        ...credentials,
      },
    });
    res.status(200).json('Successfully authorized');
  } catch (error) {
    res.status(500).json(error);
  }
};

export default handler;
