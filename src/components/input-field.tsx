import React from "react";
import { FieldError } from "react-hook-form";
import cx from "classnames";

type FieldProps = {
  name: string;
  register: (ref: Element | null) => void;
  disabled?: boolean;
  label?: string;
  type?: string;
  errors?: { [key: string]: FieldError | undefined };
  className?: string;
};

export const InputField: React.FC<FieldProps> = ({
  name,
  label,
  errors,
  type = "text",
  register,
  disabled,
  className,
  children
}) => {
  const error = errors ? errors[name] : undefined;

  return (
    <div className={cx(className, "field")}>
      <label className={cx("label", { "has-text-grey-light": disabled })}>{label || name}</label>
      <div className={cx("field", { "has-addons": !!children })}>
        <div className={cx("control", { "is-expanded": !!children })}>
          <input ref={register} {...{ name, type, disabled }} className={cx("input", { "is-danger": !!error })} />
        </div>
        {children && <div className="control">{children}</div>}
        {error !== undefined ? <p className="help is-danger">{error.message}</p> : null}
      </div>
    </div>
  );
};
