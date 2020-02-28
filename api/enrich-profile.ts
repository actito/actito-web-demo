import { NowRequest, NowResponse } from "@now/node";
import { config as dotenvConfig } from "dotenv";

import { ActitoContext, actitoApi, objectToProperties } from "./_helpers";
dotenvConfig();

/**
 * Enrich an existing profile that matches the email address provided in the body of the request
 * This method makes no security check whatsoever and as such is not recommended by actito. It is provided for illustration purposes
 *
 * actito integration framework references:
 *  - update profile
 *    https://developers.actito.com/menu/integration-framework/api-reference/data-api/profiles/profiles-update-one
 *
 * @param req request object as per zeit serverless requirements.
 * @param res response object as per zeit serverless requirements.
 */

export default async function enrichProfile(req: NowRequest, res: NowResponse): Promise<void> {
  type ActitoResponse = { profileId: number };

  type Body = {
    entity: string;
    table: string;
    emailAddress: string;
    firstName: string;
  };

  const context: ActitoContext = JSON.parse(process.env.ACTITO_CONTEXT || "{}");

  try {
    const body: Body = req.body;
    const { emailAddress, firstName } = body;
    const actitoPath = `v4/entity/${body.entity}/table/${body.table}/profile/emailAddress=${emailAddress}`;
    const { profileId } = await actitoApi<ActitoResponse>(context, "PUT", actitoPath, {
      attributes: objectToProperties({ emailAddress, firstName })
    });
    res.send({ enrichedProfileId: profileId });
  } catch (err) {
    res.status(400).send(err);
  }
}
