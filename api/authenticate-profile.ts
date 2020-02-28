import { NowRequest, NowResponse } from "@now/node";
import { config as dotenvConfig } from "dotenv";

import { ActitoContext, ActitoProperty, propertiesToObject, actitoApi } from "./_helpers";
dotenvConfig();

/**
 * Gets a profile based on the information passed in the body of the request :
 *  - fetches the profile based on the emailAddress
 *  - checks that the customerId of that profile matches the customerId provided in the request body
 *  - fails (404) if there is no match or if the profile cannot be found
 *
 * actito integration framework references:
 *  - get profile information
 *    https://developers.actito.com/menu/integration-framework/api-reference/data-api/profiles/profiles-get-one
 *
 * @param req request object as per zeit serverless requirements.
 * @param res response object as per zeit serverless requirements.
 */

export default async function handler(req: NowRequest, res: NowResponse): Promise<void> {
  type Body = {
    entity: string;
    table: string;
    emailAddress: string;
    customerId: number;
  };

  type Profile = {
    attributes: ActitoProperty[];
  };

  try {
    const context: ActitoContext = JSON.parse(process.env.ACTITO_CONTEXT || "{}");
    const body: Body = req.body;

    const actitoPath = `v4/entity/${body.entity}/table/${body.table}/profile/emailAddress=${body.emailAddress}`;
    const response = await actitoApi<Profile>(context, "GET", actitoPath);
    const profile = propertiesToObject(response.attributes);
    if (!body.customerId || profile?.CustomerID !== body.customerId) {
      res.status(404).send("Profile not found");
      return;
    }
    const { firstName, emailAddress } = profile;
    res.send({ firstName, emailAddress });
  } catch (err) {
    res.status(400).send(err);
  }
}
