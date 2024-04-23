const msal = require("@azure/msal-node");
import("node-fetch");

const tenantId = process.env.TENANT_ID
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

const clientConfig = {
  auth: {
    clientId,
    clientSecret,
    authority: `https://login.microsoftonline.com/${tenantId}`
  }
}

const authClient = new msal.ConfidentialClientApplication(clientConfig)

const queryGraphApi = async path => {

  const tokens = await authClient.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"]
  })

  const rawResult = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`
    }
  })
  return await rawResult.json()
}
module.exports = { queryGraphApi };
