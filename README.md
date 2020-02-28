# Illustration of actito integration framework for integration to a customer web site

## Use cases

- **Basic form**

  This example updates an existing profile that matches the email address with no other validation. Because of its lack of security, this approach is **not recommended** by actito.

- **Preference center**

  In this example, a first set of fields fetches the profileId based on a selection of fields (authentication), and a second set of fields is used for the actual update.

## Back end - using the integration framework

The files in the "/api" folder illustrate the use of the actito integration framework to implement the use cases above.

The credentials for the actito access are expected to be in an environment variable named ACTITO_CONTEXT. It should be a json string with the following structure:

```
{
  "environment": "prod" or "test",
  "license": <YOUR ACTITO LICENSE NAME>,
  "credentials":"<YOUR ACTITO LICENSE NAME>/<YOUR WEBSERVICE USERNAME>:<YOUR PASSWORD>"
  }
```

We use zeit.co's [serverless functions](https://zeit.co/docs/v2/serverless-functions/introduction?query=serverless#) for these illustrations.

- **Basic form**

  - `enrich-profile.ts` updates the profile in actito

- **Preference center**

  - `authenticate-profile.ts` authenticates the profile based on the fields provided. It also fetches values for prefill.
  - `update-profile.ts` updates the profile returned by the authentication.

Please see the jsdocs in the individual files for more information.

## Front end

We use [Create React App](https://create-react-app.dev/) to build the website for this illustration.

Major packages used in this illustration are :

- [Bulma](https://bulma.io/) for styling
- [Reacth Hook Form](https://react-hook-form.com/) for the form handling, with [yup](https://github.com/jquense/yup) for the form validation.
