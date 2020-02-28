import * as React from "react";
import { useForm } from "react-hook-form";

import { Logger } from "../helpers/types";
import { InputField } from "../components/input-field";
import { validationSchema } from "../helpers/validation";
import { User, entity, table } from "./constants";

type FormData = {
  emailAddress: string;
  firstName: string;
};

export const BasicForm: React.FC<Logger> = ({ addLogEntry }) => {
  const { register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: { emailAddress: User.emailAddress },
    validationSchema
  });
  const onSubmit = async (values: FormData) => {
    const response = await fetch("/api/enrich-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ entity, table, ...values })
    });
    if (response.ok) {
      const { enrichedProfileId } = await response.json();
      addLogEntry("profileId: " + enrichedProfileId + " is now firstNamed " + values.firstName);
    } else {
      addLogEntry(`error ${response.status}: ${response.statusText}`);
    }
  };

  const fieldProps = { register, errors };

  return (
    <>
      <div className="content">
        <p>
          This example updates an existing profile that matches the email address with no other validation. <br />
          Because of its lack of security, this approach is <span style={{ fontWeight: "bold" }}>not recommended </span>
          by actito.
        </p>
      </div>
      <form className="box" onSubmit={e => e.preventDefault()}>
        <InputField label="Email address" name="emailAddress" {...fieldProps} />
        <InputField label="First name" name="firstName" {...fieldProps} />
        <div className="field">
          <div className="control">
            <button className="button is-primary" type="button" onClick={handleSubmit(onSubmit)}>
              update
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
