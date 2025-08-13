import { Component, OnInit } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../shared/services/data.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiResponse } from '../Models/api-response';
import { Header } from '../Models/header';
import { DataMergeService } from '../shared/services/datamerge.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-data-merge',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './data-merge.component.html',
  styleUrl: './data-merge.component.scss'
})

export class DataMergeComponent implements OnInit {
  form!: FormGroup;
  dataSources: any = {};
  columns: any = {};
  tableIndex = 0;
  recordId: any;
  operators = [
    { value: '=', key: '=' },
    { value: '!=', key: '!=' },
    { value: '>', key: '>' },
    { value: '<', key: '<' },
    { value: '≥', key: '≥' },
    { value: '≤', key: '≤' }
  ];
  joins = [
    { value: 'Inner join', key: 'Inner join', img: 'assets/images/icons/inner.svg' },
    { value: 'Left outer join', key: 'Left outer join', img: 'assets/images/icons/left-outer.svg' },
    { value: 'Right outer join', key: 'Right outer join', img: 'assets/images/icons/right-outer.svg' },
  ];
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private notification: NzNotificationService,
    private dataMergeService: DataMergeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  get mergeQueryDetails(): FormArray {
    return this.form.get('mergeQueryDetails') as FormArray;
  }

  ngOnInit(): void {
    this.populateDataSources(this.tableIndex);
    this.initForm();
    this.route.params.subscribe((params) => {
      this.recordId = isNaN(+params['id']) ? 0 : Number(+params['id']);
    });
    if (this.recordId !== 0) {
      let formArray = this.form.get('mergeQueryDetails')?.value;
      this.getDataMergeById(this.recordId);
    } else {
      this.mergeQueryDetails.push(this.createFormGroup());
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: [0],
      name: [
        'vu_',
        {
          validators: [Validators.required, Validators.pattern(/^[^\s]*$/)],
          updateOn: 'change'
        }
      ],
      mergeQueryDetails: this.fb.array([]),
    });
  }

  addRow() {
    this.form.markAllAsTouched();
    if (!this.form.valid) return;
    this.tableIndex++;
    let formArray = this.form.get('mergeQueryDetails')?.value;
    const lastObject = formArray.at(-1);
    this.dataSources[`leftTable${this.tableIndex}`] = lastObject.rightTable;
    this.mergeQueryDetails.push(this.createFormGroup());
    this.mergeQueryDetails.at(this.tableIndex).get('leftTable')?.setValue(lastObject.rightTable);
    this.getColumns(lastObject.rightTable, 'leftTable', this.tableIndex, 'select');
  };

  createFormGroup(detail?: any): FormGroup {
    return this.fb.group({
      id: [detail?.id ? detail?.id : 0],
      mergeQueryId: [detail?.mergeQueryId ? detail?.mergeQueryId : 0],
      leftTable: [detail?.leftTable ? detail?.leftTable : null, Validators.required],
      leftTableAlias: [detail?.leftTableAlias ? detail?.leftTableAlias : null],
      joinType: [detail?.joinType ? detail?.joinType : 'Inner join'],
      joinImg: ['assets/images/icons/inner.svg'],
      rightTable: [detail?.rightTable ? detail?.rightTable : null, Validators.required],
      rightTableAlias: [detail?.rightTableAlias ? detail?.rightTableAlias : null],
      primaryColumn: [detail?.primaryColumn ? detail?.primaryColumn : null, Validators.required],
      operator: [detail?.operator ? detail?.operator : '='],
      foreignColumn: [detail?.foreignColumn ? detail?.foreignColumn : null, Validators.required],
    });
  }

  setJoinImage(detail: any, index: any) {
    const mergeQueryDetailsArray = this.form.get('mergeQueryDetails') as FormArray;
    let joinImg = this.joins.find((item) => item.value === detail.joinType)
    mergeQueryDetailsArray.at(index).get('joinImg')?.setValue(joinImg?.img);
  }

  selectOperator(value: string, index: number): void {
    this.mergeQueryDetails.at(index).get('operator')?.setValue(value);
  }

  selectJoin(join: any, index: number): void {
    this.mergeQueryDetails.at(index).get('joinType')?.setValue(join.value);
    this.mergeQueryDetails.at(index).get('joinImg')?.setValue(join.img);
  }

  populateDataSources(index: number) {
    this.dataService.getAllDataSources().subscribe(
      (repos) => {
        if (repos.success) {
          this.dataSources[`leftTable${index}`] = repos.data;
          this.dataSources[`rightTable`] = repos.data.map((item: any, index: number) => {
            return {
              no: item.no,
              name: item.name,
              alias: `p${index}`
            };
          });
        }
      },
      (err) => {
        console.error(err);
        this.notification.error('Error', err.message, { nzDuration: 3000 });
      },
      (final: void) => { }
    );
  }

  getColumns(seletedfield: any, fieldName: any, index: number, text: string) {
    this.dataService.getColumns(seletedfield).subscribe(
      (response: ApiResponse<Array<Header>>) => {
        if (!response.success) {
          this.notification.error('Error', response.message);
          return;
        }
        if (fieldName === 'leftTable') {
          this.columns[`columnsLeft${index}`] = [];
          this.columns[`columnsLeft${index}`] = response.data;
          if (text === 'select') {
            this.mergeQueryDetails.at(index).get('primaryColumn')?.reset();
          }
        } else if (fieldName === 'rightTable') {
          this.columns[`columnsRight${index}`] = [];
          this.columns[`columnsRight${index}`] = response.data;
          if (text === 'select') {
            this.mergeQueryDetails.at(index).get('foreignColumn')?.reset();
          }
        }
        let selectedObj = this.dataSources[`rightTable`].find((item: any) => item.name === seletedfield);
        this.setAliasValue(selectedObj, fieldName, index);
      },
      (error) => {
        console.log(error);
        this.notification.error('Error', error.message, { nzDuration: 3000 });
      },
      (complete: void) => {
      }
    );
  }

  setAliasValue(selectedObj: any, fieldName: string, index: number) {
    if (fieldName === 'leftTable') {
      this.mergeQueryDetails.at(index).get('leftTableAlias')?.setValue(selectedObj?.alias);
    } else if (fieldName === 'rightTable') {
      this.mergeQueryDetails.at(index).get('rightTableAlias')?.setValue(selectedObj?.alias);
    }
  }

  saveDataMerge() {
    this.form.markAllAsTouched();
    if (!this.form.valid) return;
    let formValue = this.form.value;
    if (formValue?.name.startsWith("vu_") && formValue?.name.length > 3) {
      if (formValue?.mergeQueryDetails?.length) {
        formValue.mergeQueryDetails.forEach((item: any) => {
          delete item.joinImg;
        });
      }
      this.dataMergeService.saveDataMerge(formValue).subscribe(
        (response) => {
          if (!response.success) {
            this.notification.error('Error', response.message);
            return;
          }
          this.notification.success('Success', response.message);
          this.router.navigate(['data-merge/list']);
        },
        (err) => {
          console.error(err);
          this.notification.error('Error', err.message);
        },
        (final: void) => { }
      );
    } else {
      this.form.get('name')?.markAllAsTouched();
      this.form.get('name')?.setErrors({ invalidName: true });
    }
  }

  removeRow(index: number): void {
    const mergeQueryDetails = this.form.get('mergeQueryDetails') as FormArray;
    if (index >= 0 && index < mergeQueryDetails.length) {
      mergeQueryDetails.removeAt(index);
    }
    this.tableIndex--;
  }

  inputName() {
    this.form?.get('name')?.valueChanges.subscribe((value: string) => {
      if (value === 'vu') {
        this.form.get('name')?.setValue(`vu_`, { emitEvent: false });
        return;
      }
      const noSpacesPattern = /^\S*$/;
      if (value && !value.startsWith('vu_') && noSpacesPattern.test(value)) {
        this.form.get('name')?.markAsTouched();
        this.form.get('name')?.setValue(`vu_${value}`, { emitEvent: false });
      }
    });
  }

  getDataMergeById(Id?: number) {
    this.dataMergeService.getDataMergeById(Id).subscribe(
      (repos) => {
        if (repos.success) {
          this.form.patchValue({
            id: repos.data[0].id,
            name: repos.data[0].name
          });
          const mergeQueryDetailsArray = this.form.get('mergeQueryDetails') as FormArray;
          mergeQueryDetailsArray.clear();
          repos.data[0].mergeQueryDetails.forEach((detail: any, index: number) => {
            const selectedFieldRight = detail.rightTable;
            const fieldNameRight = 'rightTable';
            this.getColumns(selectedFieldRight, fieldNameRight, index, 'edit');
            const selectedFieldLeft = detail.leftTable;
            const fieldNameLeft = 'leftTable';
            if (index !== 0) {
              this.tableIndex = index;
              this.dataSources[`leftTable${index}`] = detail.rightTable;
            }
            this.getColumns(selectedFieldLeft, fieldNameLeft, index, 'edit');
            mergeQueryDetailsArray.push(this.createFormGroup(detail));
            this.setJoinImage(detail, index);
          });
        }
      },
      (err) => {
        console.error(err);
        this.notification.error('Error', err.message, { nzDuration: 3000 });
      },
      (final: void) => { }
    );
  }
}