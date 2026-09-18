import type { ComponentProps } from 'react'
import {
  useController,
  type Control,
  type FieldValues,
  type Path
} from 'react-hook-form'
import { Field, FieldError, FieldLabel } from './field'
import { Input } from './input'

type FormProps<T extends FieldValues = FieldValues> = {
  label?: string
  control: Control<T>
  name: Path<T>
} & ComponentProps<typeof Input>

export const Form = <T extends FieldValues>({
  control,
  label,
  name,
  ...props
}: FormProps<T>) => {
  const { field, fieldState } = useController({
    control,
    name
  })

  const errorMessage = fieldState.error?.message

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>{label}</FieldLabel>

      <Input {...props} {...field} aria-invalid={fieldState.invalid} />

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
