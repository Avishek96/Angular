import { Component, OnInit } from '@angular/core';
import { DynamicFormService } from '../../core/services/dynamic-form.service';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { DynamicForm, FormField } from '../../core/models/dynamic-form.model';
import { DynamicFormComponent, DynamicFormMode } from '../../shared/components/dynamic-form/dynamic-form.component';

interface EmployeeFormValue {
  employeeName: string;
  age: number;
  email: string;
  department: string;
  joiningDate: string;
  interviewTime: string;
  availabilityRange: {
    start: string;
    end: string;
  };
  activeEmployee: boolean;
  employmentType: string;
  skills: string[];
  workMode: string;
}

interface EmployeeRecord extends EmployeeFormValue {
  id: number;
}

interface TableAction {
  name: string;
  label: string;
  handler: (employee?: EmployeeRecord) => void;
  className: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DynamicFormComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  form!: FormGroup;
  editingEmployeeId: number | null = null;

  readonly employeeHeaderActions: TableAction[] = [
    {
      name: 'addNew',
      label: 'Add new',
      handler: () => this.resetForm(),
      className: 'btn btn-outline-secondary btn-sm',
    },
  ];

  readonly employeeActions: TableAction[] = [
    {
      name: 'edit',
      label: 'Edit',
      handler: (employee) => {
        if (employee) {
          this.editEmployee(employee);
        }
      },
      className: 'btn btn-outline-primary btn-sm',
    },
  ];

  readonly employees: EmployeeRecord[] = [
    {
      id: 1,
      employeeName: 'Asha Karim',
      age: 29,
      email: 'asha.karim@example.com',
      department: 'IT',
      joiningDate: '2026-01-12',
      interviewTime: '2025-12-18T10:30',
      availabilityRange: {
        start: '2026-01-15T09:00',
        end: '2026-01-15T17:00',
      },
      activeEmployee: true,
      employmentType: 'fullTime',
      skills: ['angular', 'typescript'],
      workMode: 'hybrid',
    },
    {
      id: 2,
      employeeName: 'Tanvir Hasan',
      age: 34,
      email: 'tanvir.hasan@example.com',
      department: 'HR',
      joiningDate: '2025-09-01',
      interviewTime: '2025-08-20T14:00',
      availabilityRange: {
        start: '2025-08-21T10:00',
        end: '2025-08-21T15:30',
      },
      activeEmployee: false,
      employmentType: 'contract',
      skills: ['api'],
      workMode: 'remote',
    },
  ];

  formConfig: DynamicForm = {
    formName: 'employeeForm',
    fields: [
      {
        name: 'employeeName',
        label: 'Employee Name',
        controlType: 'text',
        validators: [{ type: 'required' }],
      },
      {
        name: 'age',
        label: 'Age',
        controlType: 'number',
        validators: [{ type: 'required' }, { type: 'min', value: 18 }],
      },
      {
        name: 'email',
        label: 'Email',
        controlType: 'email',
        validators: [{ type: 'required' }, { type: 'email' }],
      },
      {
        name: 'department',
        label: 'Department',
        controlType: 'select',
        options: [
          { label: 'IT', value: 'IT' },
          { label: 'HR', value: 'HR' },
        ],
      },
      {
        name: 'joiningDate',
        label: 'Joining Date',
        controlType: 'date',
        validators: [{ type: 'required' }],
      },
      {
        name: 'interviewTime',
        label: 'Interview Time',
        controlType: 'datetime',
        validators: [{ type: 'required' }],
      },
      {
        name: 'availabilityRange',
        label: 'Availability Range',
        controlType: 'datetime-range',
        defaultValue: {
          start: '',
          end: '',
        },
      },
      {
        name: 'activeEmployee',
        label: 'Active Employee',
        controlType: 'checkbox',
        defaultValue: true,
      },
      {
        name: 'employmentType',
        label: 'Employment Type',
        controlType: 'radio',
        defaultValue: 'fullTime',
        options: [
          { label: 'Full time', value: 'fullTime' },
          { label: 'Part time', value: 'partTime' },
          { label: 'Contract', value: 'contract' },
        ],
      },
      {
        name: 'skills',
        label: 'Skills',
        controlType: 'checkbox-group',
        defaultValue: ['angular'],
        options: [
          { label: 'Angular', value: 'angular' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'API Integration', value: 'api' },
        ],
      },
      {
        name: 'workMode',
        label: 'Work Mode',
        controlType: 'radio-group',
        defaultValue: 'hybrid',
        options: [
          { label: 'Office', value: 'office' },
          { label: 'Remote', value: 'remote' },
          { label: 'Hybrid', value: 'hybrid' },
        ],
      },
    ],
    actions: [
      {
        name: 'cancel',
        label: 'Cancel',
        handler: () => this.resetForm(),
        type: 'button',
        className: 'btn btn-outline-secondary',
        disabledWhen: 'never',
        visibleWhen: 'edit',
      },
      {
        name: 'save',
        label: 'Submit',
        handler: () => this.submit(),
        createLabel: 'Submit',
        editLabel: 'Update',
        type: 'button',
        className: 'btn btn-primary',
        disabledClassName: 'btn btn-outline-danger opacity-75 cursor-not-allowed',
        disabledWhen: 'formInvalid',
        invalidClassName: 'btn btn-outline-danger',
        validClassName: 'btn btn-primary',
        visibleWhen: 'always',
      },
    ],
  };

  constructor(private dynamicFormService: DynamicFormService) {}

  ngOnInit(): void {
    this.form = this.dynamicFormService.createForm(this.formConfig.fields);
  }

  get formModeLabel(): string {
    return this.editingEmployeeId ? 'Edit employee' : 'Add employee';
  }

  get formMode(): DynamicFormMode {
    return this.editingEmployeeId ? 'edit' : 'create';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employeeValue = this.form.getRawValue() as EmployeeFormValue;

    if (this.editingEmployeeId) {
      const employeeIndex = this.employees.findIndex(
        (employee) => employee.id === this.editingEmployeeId,
      );

      if (employeeIndex >= 0) {
        this.employees[employeeIndex] = {
          ...employeeValue,
          id: this.editingEmployeeId,
        };
      }
    } else {
      this.employees.push({
        ...employeeValue,
        id: this.nextEmployeeId(),
      });
    }

    this.resetForm();
  }

  editEmployee(employee: EmployeeRecord): void {
    this.editingEmployeeId = employee.id;
    this.form.patchValue({
      ...employee,
      availabilityRange: { ...employee.availabilityRange },
      skills: [...employee.skills],
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  runEmployeeAction(action: TableAction, employee: EmployeeRecord): void {
    action.handler(employee);
  }

  runHeaderAction(action: TableAction): void {
    action.handler();
  }

  resetForm(): void {
    this.editingEmployeeId = null;
    this.form.reset(this.defaultFormValue());
  }

  private defaultFormValue(): Record<string, unknown> {
    return this.formConfig.fields.reduce<Record<string, unknown>>((value, field) => {
      value[field.name] = this.defaultFieldValue(field);
      return value;
    }, {});
  }

  private defaultFieldValue(field: FormField): unknown {
    if (field.defaultValue !== undefined) {
      if (Array.isArray(field.defaultValue)) {
        return [...field.defaultValue];
      }

      if (typeof field.defaultValue === 'object' && field.defaultValue !== null) {
        return { ...field.defaultValue };
      }

      return field.defaultValue;
    }

    return null;
  }

  private nextEmployeeId(): number {
    return Math.max(0, ...this.employees.map((employee) => employee.id)) + 1;
  }
}
