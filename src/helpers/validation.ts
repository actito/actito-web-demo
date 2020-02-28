import * as yup from "yup";

export const validationSchema = yup.object().shape({
  emailAddress: yup
    .string()
    .email()
    .required(),
  firstName: yup.string().required()
});
