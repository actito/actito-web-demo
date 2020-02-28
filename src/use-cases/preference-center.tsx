import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { InputField } from "../components/input-field";
import { Logger } from "../helpers/types";
import { entity, table, User } from "./constants";
import * as yup from "yup";

type FormData = {
  emailAddress: string;
  customerId: number;
  firstName: string;
};

type Profile = {
  firstName: string;
};

export const PreferenceCenter: React.FC<Logger> = ({ addLogEntry }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authenticationError, setAuthenticationError] = useState<string>();

  const { register, handleSubmit, errors, setValue, clearError } = useForm<FormData>({
    defaultValues: { emailAddress: User.emailAddress },
    validationSchema: !authenticated ? authenticationSchema : updateSchema
  });

  const onSubmit = async (values: FormData) => {
    return authenticated ? updateProfile(values) : authenticateProfile(values);
  };

  const updateProfile = async (values: FormData) => {
    const customerId = parseInt(values.customerId.toString(), 10); // workaround bug in react-form-hook
    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ entity, table, ...values, customerId })
    });
    if (response.ok) {
      clearError();
      const { updatedProfileId } = await response.json();
      addLogEntry("profileId: " + updatedProfileId + " is now firstNamed " + values.firstName);
    } else {
      addLogEntry(`error ${response.status}: ${response.statusText}`);
    }
  };

  const authenticateProfile = async (values: FormData) => {
    const { emailAddress, customerId } = values;
    const body = JSON.stringify({ entity, table, emailAddress, customerId });
    const response = await fetch("/api/authenticate-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body
    });
    if (response.ok) {
      const { firstName } = (await response.json()) as Profile;
      addLogEntry("authenticated profile");
      clearError();
      setAuthenticationError(undefined);
      setValue("firstName", firstName);
      setAuthenticated(true);
    } else {
      setAuthenticationError(await response.text());
      console.error(`error ${response.status}: ${response.statusText}`);
    }
  };

  const fieldProps = { register, errors };
  return (
    <>
      <div className="content">
        <p>
          In this example, we find the profile using the email address, and check the authenticity based on a sencond
          field (in this case the customerId). We also fetch information on the authenticated profile to pre-fill fields
          to update.
        </p>
      </div>

      <form className="box" onSubmit={e => e.preventDefault()}>
        <h1 className="title">Identification</h1>
        <div className="columns">
          <InputField
            className="column"
            label="Email address"
            name="emailAddress"
            disabled={authenticated}
            {...fieldProps}
          />
          <InputField
            className="column"
            label="Customer id"
            name="customerId"
            type="number"
            disabled={authenticated}
            {...fieldProps}
          />
        </div>

        {authenticationError ? (
          <div className="field">
            <p className="help is-danger">{authenticationError}</p>
          </div>
        ) : null}

        {!authenticated && (
          <div className="control">
            <div className="field">
              <button className="button is-primary" type="button" onClick={handleSubmit(onSubmit)}>
                authenticate
              </button>
            </div>
          </div>
        )}
        <hr />
        <h1 className="title">Preferences</h1>
        <InputField label="First name" name="firstName" {...fieldProps} disabled={!authenticated} />
        <div className="control">
          <div className="field">
            <button
              className="button is-primary"
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={!authenticated}
            >
              update
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

const authenticationSchema = yup.object().shape({
  emailAddress: yup
    .string()
    .email()
    .required(),
  customerId: yup.number().required()
});

const updateSchema = yup.object().shape({
  firstName: yup.string().required()
});
