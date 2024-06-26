import { getCookie, setCookie } from 'cookies-next';
import { ApiClient, UsersApi } from 'pipedrive';
import db from './db';
import logger from './logger';
const log = logger('OAuth 🔒');

// Initialize the API client
export const initAPIClient = ({ accessToken = '', refreshToken = '' }) => {
  const client = new ApiClient();
  const oAuth2 = client.authentications.oauth2;

  // Set the Client Credentials based on the Pipedrive App details
  oAuth2.clientId = process.env.CLIENT_ID;
  oAuth2.clientSecret = process.env.CLIENT_SECRET;
  oAuth2.redirectUri = process.env.REDIRECT_URL;
  if (accessToken) oAuth2.accessToken = accessToken;
  log.info('Refresh token: '+refreshToken);
  if (refreshToken) {oAuth2.refreshToken = refreshToken}
  else{
    oAuth2.refreshToken = '12650637:16023333:74b0d2643f7a4145c0a5b8a44f011b22fe87c0bf';
    log.info('Forcing to change Refresh token to: '+ oAuth2.refreshToken);
  }//11817552:16176002:6bf2090fca2e63efee7d7b62268903159c01f735 sandbox lerta
  //12650637.16023333.43a55969b44ebf4f56785774af722b5c2e4e52fc sandbox htm
  
  return client;
};

// Safely parse JSON
const safeParseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
};

// Gets the API client based on session cookies
export const getAPIClient = (req, res) => {
  const sessionCookie = getCookie('session', { req, res });

  // Check if the session cookie exists and has a value
  if (!sessionCookie) {
    // Handle the absence of a session cookie appropriately
    throw new Error('Session cookie is missing');
  }

  // Safely parse the session cookie
  const session = safeParseJSON(sessionCookie);
  if (!session || !session.token) {
    // Handle invalid or incomplete session data appropriately
    throw new Error('Invalid session data');
  }
  return initAPIClient({
    accessToken: session.token,
  });
};


// Generate the authorization URL for the 1st step
export const getAuthorizationUrl = (client) => {
  const authUrl = client.buildAuthorizationUrl();
  log.info('Authorization URL generated');
  return authUrl;
};

// Get the currently authorized user details
export const getLoggedInUser = async (client) => {
  const api = new UsersApi(client);
  const data = await api.getCurrentUser();
  log.info('Currently logged-in user details obtained');
  return data;
};

// Update Access and Refresh tokens
export const updateTokens = (client, token) => {
  log.info('Updating access + refresh token details');
  const oAuth2 = client.authentications.oauth2;
  oAuth2.accessToken = token.access_token;
  oAuth2.refreshToken = token.refresh_token;
  log.info('Refresh token value:                ' + oAuth2.refreshToken);
};

// Get Session Details
export const initalizeSession = async (req, res, userId) => {
  try {
    // 1.1 Check if the session cookie is already set
    userId = '16023333';// TODO need to delete
    log.info(`Checking if a session cookie is set for ${userId}`);
    const session = getCookie('session', { req, res });

    // 1.2. If the session is not set, get the user ID value from the query params
    if (!session) {
      log.info(
        'Session cookie is not found. Checking the database for OAuth details'
      );
      const account = await db.user.findUnique({
        where: {
          accountId: String('16023333'), // TODO: userId htm sandbox 16023333; lerta ID 16176002
        },
      });
      // 1.3. If no entry exists in DB, the user hasn't even authorized once
      if (!account) {
        log.info('No matching account found. You need to authorize the app 🔑');
        return { auth: false };
      } else if (Date.now() > parseInt(account.expiresAt)) {
        log.info('Account details found. Access token has expired');
        const client = initAPIClient(account);
        const refreshed = await client.refreshToken();
        log.info('Token successfully refreshed');
        await db.user.update({
          where: {
            accountId: userId,
          },
          data: {
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: String(Date.now() + 59 * 60 * 1000),
          },
        });
        log.info('Database updated. Session cookie set 🍪');
        return setSessionCookie(
          true,
          account.accountId,
          account.name,
          refreshed.access_token,
          String(Date.now() + 59 * 60 * 1000),
          req,
          res
        );
      } else {
        log.info('Access token is valid. Session cookie set 🍪');
        // 1.5. Return this value to the app.
        // Make sure to set the cookie lifetime only for the remaining validity time of the access token
        return setSessionCookie(
          true,
          account.accountId,
          account.name,
          account.accessToken,
          account.expiresAt,
          req,
          res
        );
      }
    } else {
      // 2. Simply return the existing session details :)
      log.info('Session cookie found 🍪');
      return JSON.parse(session);
    }
  } catch (error) {
    log.error("Couldn't create session :[");
    log.error(error);
  }
};

// Set cookies
const setSessionCookie = (auth, id, name, token, expiry, req, res) => {
  const newSession = {
    auth,
    id,
    name,
    token,
  };

  const cookieParams = {
    maxAge: Math.round((parseInt(expiry) - Date.now()) / 1000),
    sameSite: 'none',
    secure: true,
    req,
    res,
  };
  // 1.4. Set the cookie
  setCookie('session', JSON.stringify(newSession), cookieParams);

  return newSession;
};