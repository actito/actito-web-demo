import { NowRequest, NowResponse } from "@now/node";
import { config as dotenvConfig } from "dotenv";

import { ActitoContext, actitoApi, objectToProperties, ActitoProperty, propertiesToObject } from "./_helpers";
dotenvConfig();

/**
 * Enrich an existing profile based on a profile id. As the profileId is not publicly available, this a safer approach than that used in enrich-profile.ts
 *
 * actito integration framework references:
 *  - update profile
 *    https://developers.actito.com/menu/integration-framework/api-reference/data-api/profiles/profiles-update-one
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
    firstName: string;
  };

  type ActitoProfile = {
    attributes: ActitoProperty[];
  };

  type Profile = {
    profileId: number;
    firstName: string;
    emailAddress: string;
    CustomerID: number;
  };

  type ActitoResponse = { profileId: number };

  const context: ActitoContext = JSON.parse(process.env.ACTITO_CONTEXT || "{}");
  try {
    const body: Body = req.body;
    const fetchPath = `v4/entity/${body.entity}/table/${body.table}/profile/emailAddress=${body.emailAddress}`;
    const response = await actitoApi<ActitoProfile>(context, "GET", fetchPath);
    const profile = propertiesToObject(response.attributes) as Profile;

    const updatePath = `v4/entity/${body.entity}/table/${body.table}/profile/${profile.profileId}`;
    const { profileId } = await actitoApi<ActitoResponse>(context, "PUT", updatePath, {
      attributes: objectToProperties({ firstName: body.firstName })
    });
    res.send({ updatedProfileId: profileId });
  } catch (err) {
    res.status(400).send(err);
  }
}
