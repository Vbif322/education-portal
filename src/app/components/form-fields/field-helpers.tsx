import f from "./fields.module.css";

/**
 * Разметка ошибок полей, общая для форм на useActionState + z.treeifyError().
 * Живёт рядом с fields.module.css: имена классов `inputError`/`errorMessage`
 * должны быть в одном месте со стилями, которые их описывают.
 */

type ErrorState<F extends string> =
  | { properties?: Partial<Record<F, { errors: string[] }>> }
  | undefined;

export function getFieldHelpers<F extends string>(state: ErrorState<F>) {
  const errorsFor = (field: F) => state?.properties?.[field]?.errors;

  /** Общие атрибуты инпута: id/name + связка с сообщением об ошибке. */
  const fieldProps = (field: F) => {
    const errors = errorsFor(field);
    return {
      id: field,
      name: field,
      "aria-invalid": errors ? true : undefined,
      "aria-describedby": errors ? `${field}-error` : undefined,
      className: errors ? f.inputError : undefined,
    };
  };

  const FieldError = ({ field }: { field: F }) => {
    const errors = errorsFor(field);
    if (!errors?.length) {
      return null;
    }
    return (
      <span id={`${field}-error`} className={f.errorMessage} role="alert">
        {errors.join(", ")}
      </span>
    );
  };

  return { errorsFor, fieldProps, FieldError };
}
