export interface DynamicForm {
  formName: string;
  fields: FormField[];
  actions?: FormAction[];
}

export interface FormField {
  name: string;
  label: string;
  type?: string;
  controlType: string;
  defaultValue?: any;
  validators?: ValidatorConfig[];
  options?: SelectOption[];
}

export interface ValidatorConfig {
  type: string;
  value?: any;
}

export interface SelectOption {
  label: string;
  value: any;
}

export interface FormAction {
  name: string;
  label: string;
  handler?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabledClassName?: string;
  disabledWhen?: 'never' | 'formInvalid' | 'formPristine' | 'formInvalidOrPristine';
  invalidClassName?: string;
  validClassName?: string;
  visibleWhen?: 'always' | 'create' | 'edit';
  createLabel?: string;
  editLabel?: string;
}
