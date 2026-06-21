import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  constructor(private fb: FormBuilder) {}

createForm(fields: any[]): FormGroup {

  const controls: Record<string, any> = {};

  fields.forEach(field => {

    const validators: ValidatorFn[] = [];

    field.validators?.forEach((v: any) => {

      switch (v.type) {

        case 'required':
          validators.push(Validators.required);
          break;

        case 'email':
          validators.push(Validators.email);
          break;

        case 'min':
          validators.push(Validators.min(v.value));
          break;

        case 'max':
          validators.push(Validators.max(v.value));
          break;

        case 'minLength':
          validators.push(Validators.minLength(v.value));
          break;

        case 'maxLength':
          validators.push(Validators.maxLength(v.value));
          break;
      }
    });

    controls[field.name] = [
      field.defaultValue ?? null,
      validators
    ];
  });

  return this.fb.group(controls);
}
}