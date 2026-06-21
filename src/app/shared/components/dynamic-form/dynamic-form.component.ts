import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicForm, FormAction } from '../../../core/models/dynamic-form.model';

export type DynamicFormMode = 'create' | 'edit';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) config!: DynamicForm;
  @Input() title = '';
  @Input() mode: DynamicFormMode = 'create';

  get visibleActions(): FormAction[] {
    return (this.config.actions ?? []).filter((action) => this.isActionVisible(action));
  }

  submit(): void {
    const submitAction = this.visibleActions.find((action) => action.type === 'submit');

    if (submitAction && !this.isActionDisabled(submitAction)) {
      submitAction.handler?.();
    }
  }

  runAction(action: FormAction): void {
    if (this.isActionDisabled(action)) {
      return;
    }

    action.handler?.();
  }

  actionLabel(action: FormAction): string {
    if (this.mode === 'edit' && action.editLabel) {
      return action.editLabel;
    }

    if (this.mode === 'create' && action.createLabel) {
      return action.createLabel;
    }

    return action.label;
  }

  actionClass(action: FormAction): string {
    if (this.isActionDisabled(action) && action.disabledClassName) {
      return action.disabledClassName;
    }

    if (this.form.invalid && action.invalidClassName) {
      return action.invalidClassName;
    }

    if (this.form.valid && action.validClassName) {
      return action.validClassName;
    }

    return action.className ?? 'btn btn-secondary';
  }

  isActionDisabled(action: FormAction): boolean {
    switch (action.disabledWhen ?? 'never') {
      case 'formInvalid':
        return this.form.invalid;
      case 'formPristine':
        return this.form.pristine;
      case 'formInvalidOrPristine':
        return this.form.invalid || this.form.pristine;
      default:
        return false;
    }
  }

  isCheckboxGroupSelected(fieldName: string, value: string): boolean {
    const selectedValues = this.form.get(fieldName)?.value;
    return Array.isArray(selectedValues) && selectedValues.includes(value);
  }

  toggleCheckboxGroup(fieldName: string, value: string, checked: boolean): void {
    const control = this.form.get(fieldName);
    const selectedValues = Array.isArray(control?.value) ? control.value : [];
    const nextValues = checked
      ? [...selectedValues, value]
      : selectedValues.filter((selectedValue: string) => selectedValue !== value);

    control?.setValue(nextValues);
    control?.markAsTouched();
  }

  dateTimeRangeValue(fieldName: string, key: 'start' | 'end'): string {
    const value = this.form.get(fieldName)?.value;
    return typeof value?.[key] === 'string' ? value[key] : '';
  }

  updateDateTimeRange(fieldName: string, key: 'start' | 'end', value: string): void {
    const control = this.form.get(fieldName);
    const currentValue = control?.value ?? {};

    control?.setValue({
      ...currentValue,
      [key]: value,
    });
    control?.markAsTouched();
  }

  private isActionVisible(action: FormAction): boolean {
    switch (action.visibleWhen ?? 'always') {
      case 'create':
        return this.mode === 'create';
      case 'edit':
        return this.mode === 'edit';
      default:
        return true;
    }
  }
}
