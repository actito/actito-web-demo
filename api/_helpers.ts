import fetch, { Response, RequestInit } from "node-fetch";

type ActitoValue = string | number | boolean | null;
export type ActitoObject = { [name: string]: ActitoValue };
export type ActitoProperty = { name: string; value: ActitoValue };

export type ActitoEnvironment = "test" | "prod";
export type ActitoContext = {
  environment: ActitoEnvironment;
  license: string;
  entity?: string;

  credentials?: string;
  apiKey?: string;
};

type HTTPMethod = "GET" | "POST" | "DELETE" | "PUT";

type Credentials = {
  actitoRoot: string;
  authorization: string;
};

async function getAuthorization(context: ActitoContext): Promise<Credentials> {
  if (context.credentials) {
    return basicCredentials(context); // will be deprecated when apiKeys are available
  } else if (context.apiKey) {
    return apiKeyCredentials(context); // coming soon
  } else {
    throw new Error("missing credentials");
  }
}

async function basicCredentials(context: ActitoContext): Promise<Credentials> {
  const credentials = context.credentials;
  if (credentials === undefined) throw new Error("missing credentials");
  const roots: { [environment in ActitoEnvironment]: string } = {
    test: "https://test.actito.be/ActitoWebServices/ws/",
    prod: "https://api.actito.com/ActitoWebServices/ws/"
  };
  return {
    actitoRoot: roots[context.environment],
    authorization: "Basic " + Buffer.from(credentials).toString("base64")
  };
}

export async function actitoApi<T>(
  context: ActitoContext,
  method: HTTPMethod,
  path: string,
  body: object = {}
): Promise<T> {
  const { actitoRoot, authorization } = await getAuthorization(context);
  return await fetch(actitoRoot + path, {
    method,
    headers: { Accept: "application/json", Authorization: authorization, "Content-Type": "application/json" },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
  }).then(async response => {
    if (!response.ok) {
      throw new Error(`${response.statusText} (${response.status})`);
    }
    return (method === "DELETE" ? {} : response.json()) as T;
  });
}

export function propertiesToObject(properties: ActitoProperty[]): ActitoObject {
  const result: ActitoObject = {};
  properties.forEach(({ name, value }) => (result[name] = value));
  return result;
}

export function objectToProperties(object: ActitoObject): ActitoProperty[] {
  const result: ActitoProperty[] = [];
  Object.entries(object).forEach(([name, value]) => {
    result.push({ name, value });
  });
  return result;
}

// Coming soon

async function apiKeyCredentials(context: ActitoContext): Promise<Credentials> {
  const apiKey = context.apiKey;
  if (apiKey === undefined) throw new Error("missing apiKey");
  const roots: { [environment in ActitoEnvironment]: string } = {
    test: "https://apitest.actito.com/",
    prod: "https://api.actito.com/"
  };
  const actitoRoot = roots[context.environment];
  const accessToken = await fetch(`${actitoRoot}auth/token`, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: context.apiKey }
  } as RequestInit).then(async (response: Response) => {
    if (!response.ok) throw new Error(`${response.statusText} (${response.status})`);
    return response.json().then((token: { accessToken: string }) => token.accessToken);
  });
  return { actitoRoot, authorization: `Bearer ${accessToken}` };
}
