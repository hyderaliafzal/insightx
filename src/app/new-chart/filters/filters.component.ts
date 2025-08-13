import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableFilter } from 'src/app/Models/table-filter';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnInit {
  @Input() isVisible!: boolean;
  @Input() array!: any;
  @Input() dataArray!: any;
  @Output() visibilityChange = new EventEmitter<{
    isVisible: boolean;
    dataTablefilters: TableFilter[];
  }>();
  form!: FormGroup;
  loading = false;
  dataTablefilters: TableFilter[] = [];
  operators = [
    { value: '=', key: 'Equal to' },
    { value: '!=', key: 'Not Equal to' },
    { value: '>', key: 'Greater than' },
    { value: '<', key: 'Less than' },
    { value: '>=', key: 'Greater than equal to' },
    { value: '<=', key: 'Less than equal to' },
  ];

  constructor(private fb: FormBuilder) { }

  async ngOnInit() {
    this.initForm();
    if (this.dataArray) {
      this.dataTablefilters = this.dataArray;
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: [0],
      name: [null, Validators.required],
      operation: [null, Validators.required],
      keyword: [null, Validators.required],
    });
  }

  closeDeleteConfirmationModal() {
    this.isVisible = false;
    this.emitVisibilityChange();
    this.dataTablefilters = [];
  }

  onAddButtonClick(value: any) {
    this.form.markAllAsTouched();
    if (!this.form.valid) return;
    this.dataTablefilters = this.dataTablefilters.map((item: any) => ({
      ...item,
      operationKey: this.operators.find(f => f.value === item.operation)?.key
    }));
    const newValue = {
      ...value,
      operationKey: this.operators.find(
        (op: any) => op.value === value.operation
      )?.key,
    };
    this.dataTablefilters = [...this.dataTablefilters, newValue];
    this.form.get('name')?.reset();
    this.form.get('operation')?.reset();
    this.form.get('keyword')?.reset();
  }

  handleSave() {
    this.isVisible = false;
    this.emitVisibilityChange();
    this.dataTablefilters = [];
  }

  emitVisibilityChange(): void {
    this.visibilityChange.emit({
      isVisible: this.isVisible,
      dataTablefilters: this.dataTablefilters,
    });
  }

  removeItem(item: any): void {
    this.dataTablefilters = this.dataTablefilters.filter(
      (data: any) => data !== item
    );
  }

  searchOperation(value: any) {
    return this.operators.find((item: any) => item.operation === value)?.key;
  }
}