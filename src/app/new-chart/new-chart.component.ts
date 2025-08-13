import {
  Component,
  OnInit,
  NO_ERRORS_SCHEMA,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from '../charts/charts.component';
import { GraphService } from '../shared/services/graph.service';
import { DataService } from '../shared/services/data.service';
import { ApiResponse } from 'src/app/Models/api-response';
import { GraphType } from 'src/app/Models/graph-type';
import { Graph, GraphSaveRequest, SelectedTableColumns } from '../Models/graph';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { Header } from '../Models/header';
import { DataSource } from '../Models/data-source';
import { KeyValueData } from '../Models/key-value';
import { SharedModule } from '../shared/shared.module';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FiltersComponent } from './filters/filters.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TableFilter } from '../Models/table-filter';
import {
  NzResizableModule,
  NzResizeEvent,
  NzResizeHandleOption,
} from 'ng-zorro-antd/resizable';
import { NzResizableService } from 'ng-zorro-antd/resizable';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ExportRequest } from '../Models/export-request';
import { fieldConfig } from '../Models/field-config';
import { FieldConfigGroup } from "src/app/Models/style-field";

@Component({
  selector: 'app-new-chart',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ChartsComponent,
    SharedModule,
    NzIconModule,
    FiltersComponent,
    NzResizableModule,
    CdkDrag,
    CdkDropList,
  ],
  providers: [NzResizableService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  templateUrl: './new-chart.component.html',
  styleUrl: './new-chart.component.scss',
})
export class NewChartComponent implements OnInit {
  @ViewChild('table', { static: true }) table!: any;
  tableDataColumns: any[] = [];
  tableData: any[] = [];
  dataTablefilters!: TableFilter[];
  dataSet!: any[];
  pageNumber = 1;
  totalRecords = 2;

  defaultMatricValues: any = [
    { label: 'None', value: null, isNumber: true },
    { label: 'Count', value: 'Count', isNumber: true },
    { label: 'Sum', value: 'Sum', isNumber: true },
    { label: 'Min', value: 'Min', isNumber: false },
    { label: 'Max', value: 'Max', isNumber: false },
    { label: 'Avg', value: 'Avg', isNumber: false },
  ];

  isCard: boolean = false;
  uploadInProgress: boolean = false;
  progress: number = 0;
  isCollapsedData: boolean = true;
  isCollapsedConfig: boolean = true;
  isSetupStyleVisible = false;
  selectedGraphType: GraphType = {
    id: 0,
    type: '' as ChartType,
    label: '',
    icon: '',
    isActive: true,
  };
  dataSource: string = '';
  bindingColumnValue: any = null;
  headers: Header[] = [];
  filteredHeaders: Header[] = [];
  checkedHeaders: Header[] = [];
  chartRenders: any[] = [];
  graphTypes: GraphType[] = [];
  recordId: number = 0;
  search: string = '';
  graphData: any[] = [];
  dataSources: DataSource[] = [];
  activeTab: string = 'charts';
  selectedConfTab = 0;
  matricArr: any = [];
  page = 0;
  pageSize = 15;
  loading = false;
  totalTableItems = 0;
  currentSortColumn: string | null = null;
  currentSortOrder: string | null = null;
  isVisibleFilterModal = false;
  graphForm: any;
  cardSetupForm: any;
  resizingColumn: any = null;
  startX: number = 0;
  startWidth: number = 0;
  downloadLoading: boolean = false;
  directions: NzResizeHandleOption[] = [
    {
      direction: 'right',
      cursorType: 'grid',
    },
  ];
  fieldConfig = fieldConfig;
  filteredFieldConfig: any = {};

  styleForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private graphService: GraphService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  toggleSetupStyle() {
    this.isSetupStyleVisible = !this.isSetupStyleVisible;
  }

  ngOnInit() {
    this.initGraphForm();
    this.route.params.subscribe((params) => {
      this.recordId = isNaN(+params['id']) ? 0 : Number(+params['id']);
    });
    this.getAllGraphTypes();
    const controls: Record<string, FormControl> = {};
    Object.values(this.fieldConfig)
      .flat()
      .forEach((field: any) => {
        controls[field.key] = new FormControl(field.defaultValue);
      });
    this.styleForm = new FormGroup(controls);
    this.filteredFieldConfig = { ...this.fieldConfig };
  }

  ngAfterViewInit(): void {
    const scrollContainer =
      this.table.elementRef.nativeElement.querySelector('.ant-table-body');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  initGraphForm() {
    this.graphForm = this.fb.group({
      id: [0],
      graphTitle: [null, Validators.required],
      selectedXColumnValue: [null, Validators.required],
      matricFunction: [''],
      selectedYColumnValue: [null],
    });

  }

  initCardSetupForm() {
    this.cardSetupForm = this.fb.group({
      id: [0],
      cardTitle: [null, Validators.nullValidator],
      bindingColumn: [null, Validators.required],
      matricFunction: [''],
      filters: [null],
    });
  }

  setActiveTab(activeTab: string) {
    this.activeTab = activeTab;
    if (this.activeTab === 'table') {
      if (this.dataSource.length > 0) {
        this.loading = false;
      }
      this.page = 0;
      this.tableData = [];
      this.loadDataForTable();
    }
  }

  getSortableDataForTable(event: any): void {
    let obj = event.sort.find((f: any) => f.value !== null);
    if (!obj || obj.key === undefined || obj.value === null) return;

    this.currentSortColumn = obj.key;
    this.currentSortOrder = obj.value;

    this.page = 0;
    this.tableData = [];
    this.loadDataForTable();
  }

  loadDataForTable(): void {
    if (this.loading) return;
    if (this.dataSource) {
      this.loading = true;
      let payload = {
        dataSource: this.dataSource,
        pageNumber: this.page,
        pageSize: this.pageSize,
        sort: this.currentSortColumn,
        sortOrder: this.currentSortOrder,
        filters: this.dataTablefilters,
      };
      this.dataService.getDataForTable(payload).subscribe((response) => {
        if (response.total > 0 && response.data.length > 0) {
          if (
            this.currentSortColumn === null &&
            this.currentSortOrder === null
          ) {
            this.tableDataColumns = Object.keys(response.data[0]).map((m) => {
              return {
                name: m,
                sortOrder: null,
                sortDirections: ['ascend', 'descend', null],
                sortFn: true,
                default: true,
                width: this.calculateColumnWidth(m),
              };
            });
            this.onCheckedChange();
          }
          this.tableData = [...this.tableData, ...response.data];
          this.totalTableItems = response.total;
        }
        this.loading = false;
      });
    }
  }

  onScroll(event: any): void {
    const target = event.target as HTMLElement;
    const bottom =
      target.scrollHeight - Math.ceil(target.scrollTop + target.clientHeight) <=
      1;

    if (
      bottom &&
      !this.loading &&
      this.tableData.length < this.totalTableItems
    ) {
      console.log('Scroll event triggered - loading more data');
      this.page++;
      this.loadDataForTable();
    }
  }

  getAllGraphTypes() {
    this.populateDataSources();
    this.graphService
      .getChartTypes()
      .subscribe((response: ApiResponse<GraphType[]>) => {
        if (response.success) {
          this.graphTypes = response.data;
        }
        this.editGraph();
      });
  }

  filter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    console.log('filter', event);
  }

  customSort(event: Event) {
    console.log('sort event', event);
  }

  saveChart() {
    if (this.isCard) {
      this.cardSetupForm.markAllAsTouched();
      if (!this.cardSetupForm.valid) return;
      if (
        this.cardSetupForm.get('bindingColumn').value &&
        this.cardSetupForm.get('matricFunction').value
      ) {
        let payload: GraphSaveRequest = {
          id: this.recordId
            ? this.recordId
            : this.cardSetupForm.get('id').value,
          name: this.cardSetupForm.get('cardTitle').value,
          typeId: this.selectedGraphType.id,
          dataSource: this.dataSource,
          matricFunction: this.cardSetupForm.get('matricFunction').value,
          graphColumns: [],
          graphTableFilters: this.dataTablefilters,
          graphStyling: [],
          selectedTableColumns: this.headers
            .filter((item: any) => item.checked === true)
            .map((item: SelectedTableColumns) => ({
              id: 0,
              name: item.name,
            })),
        };

        if (this.cardSetupForm.get('bindingColumn').value) {
          payload.graphColumns.push({
            id: 0,
            graphId: 0,
            name: this.cardSetupForm
              .get('bindingColumn')
              ?.value?.name.toString(),
            isNumber: this.cardSetupForm.get('bindingColumn').value?.isNumber,
          });
        }
        if (this.cardSetupForm.get('matricFunction').value) {
          payload.graphColumns.push({
            id: 0,
            graphId: 0,
            name: this.cardSetupForm.get('matricFunction').value,
            isNumber: false,
          });
        }

        this.graphService
          .saveGraph(payload)
          .subscribe((response: ApiResponse<Graph>) => {
            if (!response.success) {
              this.notification.error('Error', response.message, {
                nzDuration: 3000,
              });
              return;
            }
            this.notification.success('Success', response.message, {
              nzDuration: 3000,
            });
          });
      }
    } else {
      this.graphForm.markAllAsTouched();
      if (!this.graphForm.valid) return;
      if (
        this.graphForm.get('selectedXColumnValue').value ||
        (this.graphForm.get('selectedYColumnValue').value &&
          this.chartRenders.length > 0)
      ) {
        let payload: GraphSaveRequest = {
          id: this.recordId ? this.recordId : this.graphForm.get('id').value,
          name: this.graphForm.get('graphTitle').value,
          typeId: this.selectedGraphType.id,
          dataSource: this.dataSource,
          matricFunction: this.graphForm.get('matricFunction').value,
          graphColumns: [],
          graphTableFilters: this.dataTablefilters,
          graphStyling: [this.styleForm.value],
          selectedTableColumns: this.headers
            .filter((item: any) => item.checked === true)
            .map((item: SelectedTableColumns) => ({
              id: 0,
              name: item.name,
            })),
        };

        if (this.graphForm.get('selectedXColumnValue').value) {
          payload.graphColumns.push({
            id: 0,
            graphId: 0,
            name: this.graphForm
              .get('selectedXColumnValue')
              ?.value?.name.toString(),
            isNumber: this.graphForm.get('selectedXColumnValue').value
              ?.isNumber,
          });
        }
        if (this.graphForm.get('selectedYColumnValue').value) {
          payload.graphColumns.push({
            id: 0,
            graphId: 0,
            name: this.graphForm
              .get('selectedYColumnValue')
              .value?.name.toString(),
            isNumber: this.graphForm.get('selectedYColumnValue').value
              ?.isNumber,
          });
        }

        this.graphService
          .saveGraph(payload)
          .subscribe((response: ApiResponse<Graph>) => {
            if (!response.success) {
              this.notification.error('Error', response.message, {
                nzDuration: 3000,
              });
              return;
            }
            this.notification.success('Success', response.message, {
              nzDuration: 3000,
            });
          });
      }
    }
  }

  selectGraph(graphType: GraphType) {
    this.selectedGraphType = graphType;
    this.resetFormToDefaults();
    this.updateYColumnValidation();
    if (graphType.id === 6) {
      this.initCardSetupForm();
      this.isCard = true;
      this.chartRenders = [];
    } else {
      this.renderGraphData();
      this.isCard = false;
    }
  }

  resetFormToDefaults() {
    const controls = this.styleForm.controls;
    Object.keys(this.fieldConfig).forEach((sectionKey) => {
      const section = this.fieldConfig[sectionKey as keyof FieldConfigGroup];
      section?.forEach((field: any) => {
        if (controls[field.key]) {
          controls[field.key].setValue(
            field.defaultValue !== undefined ? field.defaultValue : ''
          );
        }
      });
    });
  }

  updateYColumnValidation() {
    const yColumnControl = this.graphForm.get('selectedYColumnValue');
    if ([3, 4].includes(this.selectedGraphType.id)) {
      yColumnControl.clearValidators();
    } else {
      yColumnControl.setValidators(Validators.required);
    }
    yColumnControl.updateValueAndValidity();
  }

  renderGraphData() {
    const data: { labels: string[]; datasets: any[]; options: ChartOptions } = {
      labels: [],
      datasets: [],
      options: {},
    };

    let selectedMatricFunction = this.isCard
      ? this.cardSetupForm.get('bindingColumn').value
      : this.graphForm.get('matricFunction').value;
    if (this.graphForm.get('selectedXColumnValue').value?.name) {
      if (
        (this.selectedGraphType.type == 'doughnut' ||
          this.selectedGraphType.type == 'pie') && this.graphForm.get('matricFunction').value !== ""
      ) {
        this.dataService
          .getDataForGraph(
            this.dataSource,
            this.graphForm.get('selectedXColumnValue').value?.name,
            null,
            selectedMatricFunction,
            this.dataTablefilters
          )
          .subscribe(
            (response: ApiResponse<Array<KeyValueData>>) => {
              if (!response.success) {
                this.notification.error('Error', response.message, {
                  nzDuration: 3000,
                });
                return;
              }
              data.datasets.push({
                label: this.graphForm.get('selectedXColumnValue').value?.name,
                data: response.data.map((m) => m.value),
                backgroundColor: this.styleForm.get('backgroundColor')?.value
                  ? this.styleForm.get('backgroundColor')?.value
                  : '',
                borderAlign: this.styleForm.get('borderAlign')?.value
                  ? this.styleForm.get('borderAlign')?.value
                  : 'center',
                borderColor: this.styleForm.get('borderColor')?.value
                  ? this.styleForm.get('borderColor')?.value
                  : '',
                borderDash: this.styleForm.get('borderDash')?.value
                  ? this.styleForm.get('borderDash')?.value
                  : [],
                borderDashOffset: this.styleForm.get('borderDashOffset')?.value
                  ? this.styleForm.get('borderDashOffset')?.value
                  : 0.0,
                borderJoinStyle: this.styleForm.get('borderJoinStyle')?.value
                  ? this.styleForm.get('borderJoinStyle')?.value
                  : undefined,
                borderRadius:
                  this.styleForm.get('borderRadius')?.value !== ''
                    ? this.styleForm.get('borderRadius')?.value
                    : 0,
                borderWidth:
                  this.styleForm.get('borderWidth')?.value !== ''
                    ? this.styleForm.get('borderWidth')?.value
                    : 2,
                offset:
                  this.styleForm.get('offset')?.value !== ''
                    ? this.styleForm.get('offset')?.value
                    : 0,
                rotation: this.styleForm.get('rotation')?.value
                  ? this.styleForm.get('rotation')?.value
                  : undefined,
                spacing:
                  this.styleForm.get('spacing')?.value !== ''
                    ? this.styleForm.get('spacing')?.value
                    : 0,
                weight:
                  this.styleForm.get('weight')?.value !== ''
                    ? this.styleForm.get('weight')?.value
                    : 1,
                hoverBackgroundColor: this.styleForm.get('hoverBackgroundColor')
                  ?.value
                  ? this.styleForm.get('hoverBackgroundColor')?.value
                  : '',
                hoverBorderColor: this.styleForm.get('hoverBorderColor')?.value
                  ? this.styleForm.get('hoverBorderColor')?.value
                  : '',
                hoverBorderDash: this.styleForm.get('hoverBorderDash')?.value
                  ? this.styleForm.get('hoverBorderDash')?.value
                  : [],
                hoverBorderDashOffset:
                  this.styleForm.get('hoverBorderDashOffset')?.value !== ''
                    ? this.styleForm.get('hoverBorderDashOffset')?.value
                    : 0,
                hoverBorderJoinStyle: this.styleForm.get('hoverBorderJoinStyle')
                  ?.value
                  ? this.styleForm.get('hoverBorderJoinStyle')?.value
                  : '',
                hoverBorderWidth:
                  this.styleForm.get('hoverBorderWidth')?.value !== ''
                    ? this.styleForm.get('hoverBorderWidth')?.value
                    : 1,
                hoverOffset:
                  this.styleForm.get('hoverOffset')?.value !== ''
                    ? this.styleForm.get('hoverOffset')?.value
                    : 0,
              });
              this.notification.success('Success', response.message, {
                nzDuration: 3000,
              });
              this.styleForm.get('isXAxisShow')?.setValue(false);
              this.styleForm.get('isYAxisShow')?.setValue(false);
              this.setChartRender(data);
            },
            (error) => {
              console.log(error);
              this.notification.error('Error', error.message, {
                nzDuration: 3000,
              });
            },
            (complete: void) => { }
          );
      }
    }

    if (
      this.graphForm.get('selectedXColumnValue').value?.name &&
      this.graphForm.get('selectedYColumnValue').value?.name &&
      this.selectedGraphType.type === 'bar'
    ) {
      this.dataService
        .getDataForGraph(
          this.dataSource,
          this.graphForm.get('selectedXColumnValue').value?.name,
          this.graphForm.get('selectedYColumnValue').value?.name,
          selectedMatricFunction,
          this.dataTablefilters
        )
        .subscribe(
          (response: ApiResponse<Array<KeyValueData>>) => {
            data.labels = response.data.map((m) => m.label) as string[];
            data.datasets.push({
              label: this.graphForm.get('selectedYColumnValue').value?.name,
              data: response.data.map((m) => m.value),
              backgroundColor: this.styleForm.get('backgroundColor')?.value ? this.styleForm.get('backgroundColor')?.value : '',
              barPercentage: this.styleForm.get('barPercentage')?.value !== "" ? this.styleForm.get('barPercentage')?.value : 0.9,
              barThickness: this.styleForm.get('barThickness')?.value !== "" ? this.styleForm.get('barThickness')?.value : 1,
              borderColor: this.styleForm.get('borderColor')?.value ? this.styleForm.get('borderColor')?.value : '',
              borderSkipped: this.styleForm.get('borderSkipped')?.value ? this.styleForm.get('borderSkipped')?.value : 'start',
              borderWidth: this.styleForm.get('borderWidth')?.value !== "" ? this.styleForm.get('borderWidth')?.value : 1,
              borderRadius: this.styleForm.get('borderRadius')?.value !== "" ? this.styleForm.get('borderRadius')?.value : 0,
              categoryPercentage: this.styleForm.get('categoryPercentage')?.value !== "" ? this.styleForm.get('categoryPercentage')?.value : 0.8,
              hoverBackgroundColor: this.styleForm.get('hoverBackgroundColor')?.value ? this.styleForm.get('hoverBackgroundColor')?.value : '',
              hoverBorderColor: this.styleForm.get('hoverBorderColor')?.value ? this.styleForm.get('hoverBorderColor')?.value : '',
              hoverBorderWidth: this.styleForm.get('hoverBorderWidth')?.value !== "" ? this.styleForm.get('hoverBorderWidth')?.value : 1,
              hoverBorderRadius: this.styleForm.get('hoverBorderRadius')?.value !== "" ? this.styleForm.get('hoverBorderRadius')?.value : 0,
              pointStyle: this.styleForm.get('pointStyle')?.value ? this.styleForm.get('pointStyle')?.value : 'circle',
              maxBarThickness: this.styleForm.get('maxBarThickness')?.value !== "" ? this.styleForm.get('maxBarThickness')?.value : 1,
              minBarLength: this.styleForm.get('minBarLength')?.value !== "" ? this.styleForm.get('minBarLength')?.value : 1,
            });
            this.setChartRender(data);
          },
          (error) => {
            console.log(error);
            this.notification.error('Error', error.message, {
              nzDuration: 3000,
            });
          },
          (complete: void) => { }
        );
    } else if (
      this.graphForm.get('selectedXColumnValue').value?.name &&
      this.graphForm.get('selectedYColumnValue').value?.name &&
      this.selectedGraphType.type === 'line'
    ) {
      this.dataService
        .getDataForGraph(
          this.dataSource,
          this.graphForm.get('selectedXColumnValue').value?.name,
          this.graphForm.get('selectedYColumnValue').value?.name,
          selectedMatricFunction,
          this.dataTablefilters
        )
        .subscribe(
          (response: ApiResponse<Array<KeyValueData>>) => {
            data.labels = response.data.map((m) => m.label) as string[];
            data.datasets.push({
              label: this.graphForm.get('selectedYColumnValue').value?.name,
              data: response.data.map((m) => m.value),
              backgroundColor: this.styleForm.get('backgroundColor')?.value ? this.styleForm.get('backgroundColor')?.value : '',
              borderCapStyle: this.styleForm.get('borderCapStyle')?.value ? this.styleForm.get('borderCapStyle')?.value : 'butt',
              borderColor: this.styleForm.get('borderColor')?.value ? this.styleForm.get('borderColor')?.value : '',
              borderDash: this.styleForm.get('borderDash')?.value ? this.styleForm.get('borderDash')?.value : [],
              fill: this.styleForm.get('fill')?.value !== false ? this.styleForm.get('fill')?.value : false,
              spanGaps: this.styleForm.get('spanGaps')?.value !== false ? this.styleForm.get('spanGaps')?.value : false,
              borderDashOffset: this.styleForm.get('borderDashOffset')?.value !== "" ? this.styleForm.get('borderDashOffset')?.value : 0.0,
              tension: this.styleForm.get('tension')?.value !== "" ? this.styleForm.get('tension')?.value : 0,
              borderJoinStyle: this.styleForm.get('borderJoinStyle')?.value ? this.styleForm.get('borderJoinStyle')?.value : undefined,
              borderWidth: this.styleForm.get('borderWidth')?.value !== "" ? this.styleForm.get('borderWidth')?.value : 2,
              hoverBackgroundColor: this.styleForm.get('hoverBackgroundColor')?.value ? this.styleForm.get('hoverBackgroundColor')?.value : '',
              hoverBorderCapStyle: this.styleForm.get('hoverBorderCapStyle')?.value ? this.styleForm.get('hoverBorderCapStyle')?.value : undefined,
              hoverBorderColor: this.styleForm.get('hoverBorderColor')?.value ? this.styleForm.get('hoverBorderColor')?.value : undefined,
              hoverBorderDash: this.styleForm.get('hoverBorderDash')?.value ? this.styleForm.get('hoverBorderDash')?.value : undefined,
              hoverBorderDashOffset: this.styleForm.get('hoverBorderDashOffset')?.value ? this.styleForm.get('hoverBorderDashOffset')?.value : undefined,
              hoverBorderJoinStyle: this.styleForm.get('hoverBorderJoinStyle')?.value ? this.styleForm.get('hoverBorderJoinStyle')?.value : undefined,
              hoverBorderWidth: this.styleForm.get('hoverBorderWidth')?.value ? this.styleForm.get('hoverBorderWidth')?.value : undefined,
              pointBackgroundColor: this.styleForm.get('pointBackgroundColor')?.value ? this.styleForm.get('pointBackgroundColor')?.value : '',
              pointBorderColor: this.styleForm.get('pointBorderColor')?.value ? this.styleForm.get('pointBorderColor')?.value : '',
              pointBorderWidth: this.styleForm.get('pointBorderWidth')?.value !== "" ? this.styleForm.get('pointBorderWidth')?.value : 1,
              pointHitRadius: this.styleForm.get('pointHitRadius')?.value !== "" ? this.styleForm.get('pointHitRadius')?.value : 1,
              pointHoverBackgroundColor: this.styleForm.get('pointHoverBackgroundColor')?.value ? this.styleForm.get('pointHoverBackgroundColor')?.value : undefined,
              pointHoverBorderColor: this.styleForm.get('pointHoverBorderColor')?.value ? this.styleForm.get('pointHoverBorderColor')?.value : undefined,
              pointHoverBorderWidth: this.styleForm.get('pointHoverBorderWidth')?.value !== "" ? this.styleForm.get('pointHoverBorderWidth')?.value : 1,
              pointHoverRadius: this.styleForm.get('pointHoverRadius')?.value !== "" ? this.styleForm.get('pointHoverRadius')?.value : 4,
              pointRadius: this.styleForm.get('pointRadius')?.value !== "" ? this.styleForm.get('pointRadius')?.value : 3,
              pointRotation: this.styleForm.get('pointRotation')?.value !== "" ? this.styleForm.get('pointRotation')?.value : 0,
              pointStyle: this.styleForm.get('pointStyle')?.value ? this.styleForm.get('pointStyle')?.value : 'circle',
            });
            this.setChartRender(data);
          },
          (error) => {
            console.log(error);
            this.notification.error('Error', error.message, {
              nzDuration: 3000,
            });
          },
          (complete: void) => { }
        );
    } else if (
      this.graphForm.get('selectedXColumnValue').value?.name &&
      this.graphForm.get('selectedYColumnValue').value?.name &&
      this.selectedGraphType.type === 'scatter'
    ) {
      this.dataService
        .getDataForGraph(
          this.dataSource,
          this.graphForm.get('selectedXColumnValue').value?.name,
          this.graphForm.get('selectedYColumnValue').value?.name,
          selectedMatricFunction,
          this.dataTablefilters
        )
        .subscribe(
          (response: ApiResponse<Array<KeyValueData>>) => {
            data.labels = response.data.map((m) => m.label) as string[];
            data.datasets.push({
              label: this.graphForm.get('selectedYColumnValue').value?.name,
              data: response.data.map((m) => m.value),
              backgroundColor: this.styleForm.get('backgroundColor')?.value
                ? this.styleForm.get('backgroundColor')?.value
                : '',
              borderColor: this.styleForm.get('borderColor')?.value
                ? this.styleForm.get('borderColor')?.value
                : '',
              borderWidth:
                this.styleForm.get('borderWidth')?.value !== ''
                  ? this.styleForm.get('borderWidth')?.value
                  : 2,
              hoverBackgroundColor: this.styleForm.get('hoverBackgroundColor')
                ?.value
                ? this.styleForm.get('hoverBackgroundColor')?.value
                : '',
              hoverBorderColor: this.styleForm.get('hoverBorderColor')?.value
                ? this.styleForm.get('hoverBorderColor')?.value
                : undefined,
              hoverBorderWidth: this.styleForm.get('hoverBorderWidth')?.value
                ? this.styleForm.get('hoverBorderWidth')?.value
                : undefined,
              borderJoinStyle: this.styleForm.get('borderJoinStyle')?.value
                ? this.styleForm.get('borderJoinStyle')?.value
                : undefined,
              hoverBorderCapStyle: this.styleForm.get('hoverBorderCapStyle')
                ?.value
                ? this.styleForm.get('hoverBorderCapStyle')?.value
                : undefined,
              hoverBorderDashOffset: this.styleForm.get('hoverBorderDashOffset')
                ?.value
                ? this.styleForm.get('hoverBorderDashOffset')?.value
                : undefined,
              hoverBorderJoinStyle: this.styleForm.get('hoverBorderJoinStyle')
                ?.value
                ? this.styleForm.get('hoverBorderJoinStyle')?.value
                : undefined,
              pointBackgroundColor: this.styleForm.get('pointBackgroundColor')
                ?.value
                ? this.styleForm.get('pointBackgroundColor')?.value
                : '',
              pointBorderColor: this.styleForm.get('pointBorderColor')?.value
                ? this.styleForm.get('pointBorderColor')?.value
                : '',
              pointBorderWidth:
                this.styleForm.get('pointBorderWidth')?.value !== ''
                  ? this.styleForm.get('pointBorderWidth')?.value
                  : 1,
              pointRadius:
                this.styleForm.get('pointRadius')?.value !== ''
                  ? this.styleForm.get('pointRadius')?.value
                  : 3,
              pointHoverBackgroundColor: this.styleForm.get(
                'pointHoverBackgroundColor'
              )?.value
                ? this.styleForm.get('pointHoverBackgroundColor')?.value
                : undefined,
              pointHoverBorderColor: this.styleForm.get('pointHoverBorderColor')
                ?.value
                ? this.styleForm.get('pointHoverBorderColor')?.value
                : undefined,
              pointHoverBorderWidth:
                this.styleForm.get('pointHoverBorderWidth')?.value !== ''
                  ? this.styleForm.get('pointHoverBorderWidth')?.value
                  : 1,
              pointHoverRadius:
                this.styleForm.get('pointHoverRadius')?.value !== ''
                  ? this.styleForm.get('pointHoverRadius')?.value
                  : 4,
              pointStyle: this.styleForm.get('pointStyle')?.value
                ? this.styleForm.get('pointStyle')?.value
                : 'circle',
            });
            this.setChartRender(data);
          },
          (error) => {
            console.log(error);
            this.notification.error('Error', error.message, {
              nzDuration: 3000,
            });
          },
          (complete: void) => { }
        );
    }
  }

  setChartRender(data: {
    labels: string[];
    datasets: any[];
    options: ChartOptions;
  }) {
    this.chartRenders = [];
    this.chartRenders = [
      {
        type: this.selectedGraphType?.type,
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: this.styleForm.get('isLegendShow')?.value,
              labels: {
                font: {
                  family: this.styleForm.get('legendFontFamily')?.value || 'Arial',
                  size: this.styleForm.get('legendFontSize')?.value || 12,
                  weight: this.styleForm.get('legendFontWeight')?.value || 'normal',
                  style: this.styleForm.get('legendFontStyle')?.value || 'normal',
                },
              },
            },
            tooltip: {
              bodyFont: {
                family:
                  this.styleForm.get('tooltipFontFamily')?.value || 'Arial',
                size: this.styleForm.get('tooltipFontSize')?.value || 12,
                weight:
                  this.styleForm.get('tooltipFontWeight')?.value || 'normal',
                style:
                  this.styleForm.get('tooltipFontStyle')?.value || 'normal',
              },
            },
          },
          maintainAspectRatio: false,
          tooltips: {},
          scales: {
            x: {
              beginAtZero: this.styleForm.get('beginAtZeroX')?.value ?? true,
              ...(this.selectedGraphType?.id !== 3 && this.selectedGraphType?.id !== 4
                ? {
                  ticks: {
                    stepSize: this.styleForm.get('stepSizeX')?.value,
                    min: this.styleForm.get('minX')?.value,
                    max: this.styleForm.get('maxX')?.value,
                  },
                }
                : {}),
              display: this.styleForm.get('isXAxisShow')?.value,
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: this.styleForm.get('beginAtZeroY')?.value,
              ...(this.selectedGraphType?.id !== 3 && this.selectedGraphType?.id !== 4
                ? {
                  ticks: {
                    stepSize: this.styleForm.get('stepSizeY')?.value,
                    min: this.styleForm.get('minY')?.value,
                    max: this.styleForm.get('maxY')?.value,
                  },
                }
                : {}),
              display: this.styleForm.get('isYAxisShow')?.value,
              grid: {
                display: false,
              },
            },
          },
          elements: {
            point: {
              radius: this.selectedGraphType.id === 5 ? 0 : 3,
            },
            line: {
              borderWidth: 1,
            },
          },
        },
      },
    ];
    let fieldsArr = this.chartRenders[0]?.data?.datasets[0];
    if (fieldsArr) {
      const validKeys = new Set(Object?.keys(fieldsArr));
      this.filteredFieldConfig = {
        scales: ![3, 4].includes(this.selectedGraphType.id) ? this.fieldConfig.scales : [],
        graph: this.fieldConfig.graph?.filter((field: any) => 
          (field.type === 'heading' && (this.selectedGraphType.type === field.graphType || field.graphType === 'all')) || validKeys.has(field.key)),
        legend: this.fieldConfig.legend,
        tooltip: this.fieldConfig.tooltip,
        hover: this.fieldConfig.hover?.filter((field: any) =>
          (field.type === 'heading' && (this.selectedGraphType.type === field.graphType || field.graphType === 'all')) || validKeys.has(field.key)
        ),
        point: ![3, 4].includes(this.selectedGraphType.id) ? this.fieldConfig.point?.filter((field: any) =>
          (field.type === 'heading' && (this.selectedGraphType.type === field.graphType || field.graphType === 'all')) || validKeys.has(field.key)) : [],
      };
    }
  }

  editGraph() {
    if (this.recordId > 0) {
      this.graphService
        .getGraphById(this.recordId)
        .subscribe((response: ApiResponse<Graph>) => {
          if (!response.success) {
            this.notification.error('Error', response.message);
            return;
          }
          if (response.data.graphType?.id === 6) {
            this.initCardSetupForm();
            this.isCard = true;
            this.cardSetupForm.get('id').setValue(response.data.id);
            this.cardSetupForm.get('cardTitle').setValue(response.data.name);

            this.selectedGraphType = response.data.graphType as GraphType;
            this.dataTablefilters = response.data.graphTableFilters;
            this.getColumns(response.data.dataSource, () => {
              this.headers = this.headers.map((header) => {
                const isPresent = response.data.selectedTableColumns.some(
                  (column: any) => column.name === header.name
                );
                const seletedColumn = response.data.selectedTableColumns.find(
                  (column: any) => column.name === header.name
                );
                return {
                  ...header,
                  checked: isPresent,
                  id: seletedColumn ? seletedColumn?.id : 0,
                };
              });
              this.filteredHeaders = [...this.headers];
              this.checkedHeaders = this.headers.filter((item) => item.checked);
              if (response.data?.graphColumns.length > 0) {
                const xColumn = response.data.graphColumns[0];
                this.cardSetupForm
                  .get('bindingColumn')
                  .setValue(
                    this.checkedHeaders.find(
                      (header) => header.name === xColumn.name
                    )
                  );
                this.populateMatric();
                this.cardSetupForm.get('matricFunction').setValue(response.data.matricFunction);
                if (response.data.graphColumns.length > 1) {
                  const yColumn = response.data.graphColumns[1];
                  this.cardSetupForm
                    .get('matricFunction')
                    .setValue(
                      this.matricArr.find(
                        (matric: any) => matric.value === yColumn.name
                      ).value
                    );
                }
              }
              this.getMatricOperationValue();
              this.notification.success('Success', response.message, {
                nzDuration: 3000,
              });
            });
          } else {
            this.graphForm.get('id').setValue(response.data.id);
            this.graphForm.get('graphTitle').setValue(response.data.name);
            this.graphForm.get('matricFunction').setValue(response.data.matricFunction);
            this.selectedGraphType = response.data.graphType as GraphType;
            this.updateYColumnValidation();
            this.dataTablefilters = response.data.graphTableFilters;
            this.styleForm.patchValue(response.data.graphStyling[0]);
            this.getColumns(response.data.dataSource, () => {
              this.headers = this.headers.map((header) => {
                const isPresent = response.data.selectedTableColumns.some(
                  (column: any) => column.name === header.name
                );
                const seletedColumn = response.data.selectedTableColumns.find(
                  (column: any) => column.name === header.name
                );
                return {
                  ...header,
                  checked: isPresent,
                  id: seletedColumn ? seletedColumn?.id : 0,
                };
              });
              this.filteredHeaders = [...this.headers];
              this.checkedHeaders = this.headers.filter((item) => item.checked);
              if (response.data?.graphColumns.length > 0) {
                const xColumn = response.data.graphColumns[0];

                this.graphForm
                  .get('selectedXColumnValue')
                  .setValue(
                    this.checkedHeaders.find(
                      (header) => header.name === xColumn.name
                    )
                  );
                this.populateMatric();
                this.graphForm.get('matricFunction').setValue(response.data.matricFunction);
                if (response.data.graphColumns.length > 1) {
                  const yColumn = response.data.graphColumns[1];
                  this.graphForm
                    .get('selectedYColumnValue')
                    .setValue(
                      this.checkedHeaders.find(
                        (header) => header.name === yColumn.name
                      )
                    );
                }
              }
              this.renderGraphData();
              this.notification.success('Success', response.message, {
                nzDuration: 3000,
              });
            });
          }
        });
    }
  }

  selectDataSource(dataSource: string) {
    this.dataTablefilters = [];
    this.getColumns(dataSource);
  }

  getColumns(dataSource: string, onComplete: any | null = null) {
    if (this.dataSource !== dataSource) {
      this.dataService.getColumns(dataSource).subscribe(
        (response: ApiResponse<Array<Header>>) => {
          if (!response.success) {
            this.notification.error('Error', response.message);
            return;
          }
          this.dataSource = dataSource;
          if (this.activeTab === 'table') {
            this.currentSortColumn = null;
            this.currentSortOrder = null;
            this.page = 0;
            this.tableData = [];
            this.loadDataForTable();
          }
          this.headers = response.data.map((header: any) => ({
            ...header,
            checked: true,
          }));
          this.checkedHeaders = [...this.headers];
          this.searchHeaders();
          if (onComplete == null) {
            this.clearSelection('X');
            this.clearSelection('Y');
          }
          this.chartRenders = [];
        },
        (error) => {
          console.log(error);
          this.notification.error('Error', error.message, { nzDuration: 3000 });
        },
        (complete: void) => {
          if (onComplete) {
            onComplete();
          }
        }
      );
    }
  }

  populateDataSources() {
    this.dataService.getAllDataSources().subscribe(
      (repos) => {
        if (repos.success) {
          this.dataSources = repos.data;
        }
      },
      (err) => {
        console.error(err);
        this.notification.error('Error', err.message, { nzDuration: 3000 });
      },
      (final: void) => { }
    );
  }

  toggleCollapseData() {
    this.isCollapsedData = !this.isCollapsedData;
  }
  toggleCollapseConfig() {
    this.isCollapsedConfig = !this.isCollapsedConfig;
  }

  searchHeaders() {
    if (!this.search) {
      this.filteredHeaders = this.headers;
    }
    this.filteredHeaders = this.headers.filter((header) =>
      header.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  clearSelection(dropdown: string) {
    if (dropdown === 'X') {
      this.graphForm.get('selectedXColumnValue').setValue(null);
    } else {
      this.graphForm.get('selectedYColumnValue').setValue(null);
    }
    this.clearGraph();
  }
  pageIndexChanged(event: any) {
    console.log('event', event);
  }

  openFiltersModal() {
    this.isVisibleFilterModal = true;
  }

  handleModalVisibilityChange(event: {
    isVisible: boolean;
    dataTablefilters: TableFilter[];
  }): void {
    this.isVisibleFilterModal = event.isVisible;
    this.dataTablefilters = event.dataTablefilters;

    this.page = 0;
    this.tableData = [];
    this.loadDataForTable();
  }

  removeItem(item: any): void {
    this.dataTablefilters = this.dataTablefilters.filter(
      (data) => data !== item
    );

    this.page = 0;
    this.tableData = [];
    this.loadDataForTable();
  }

  calculateColumnWidth(name: string): string {
    const calculatedWidth = name.length * 10;
    return calculatedWidth < 100 ? '125px' : `${calculatedWidth}px`;
  }

  onCheckedChange(): void {
    this.tableDataColumns = this.tableDataColumns.map((column) => {
      const matchingHeader = this.filteredHeaders.find(
        (header) => header.name === column.name
      );
      return {
        ...column,
        default: matchingHeader?.checked,
        id: matchingHeader?.id,
      };
    });
    this.tableDataColumns = [...this.tableDataColumns];
    this.checkedHeaders = this.headers.filter((item) => item.checked);
    let selectedXValue = this.graphForm.get('selectedXColumnValue').value?.name;
    let itemX = this.checkedHeaders.find(
      (header: any) => header.name === selectedXValue
    );
    if (itemX === undefined) {
      this.graphForm.get('selectedXColumnValue').setValue(null);
    }
    let selectedYValue = this.graphForm.get('selectedYColumnValue').value?.name;
    let itemY = this.checkedHeaders.find(
      (header: any) => header.name === selectedYValue
    );
    if (itemY === undefined) {
      this.graphForm.get('selectedYColumnValue').setValue(null);
    }
    this.clearGraph();
  }

  clearGraph() {
    if (
      !this.graphForm.get('selectedXColumnValue')?.value?.name ||
      !this.graphForm.get('selectedYColumnValue')?.value?.name
    ) {
      this.setChartRender({
        labels: [],
        datasets: [],
        options: {},
      });
      return;
    }
  }

  enableStyle() {
    this.isCard = !this.isCard;
    this.isCard ? (this.selectedConfTab = 1) : (this.selectedConfTab = 0);
  }

  populateMatric() {
    let bindingColumn: any = {};

    if (this.isCard) {
      bindingColumn = this.cardSetupForm.get('bindingColumn').value;

      this.matricArr = !bindingColumn.isNumber
        ? this.defaultMatricValues.filter((f: any) => f.isNumber || f.key == "None")
        : this.defaultMatricValues;

      this.cardSetupForm.get('matricFunction')?.setValue('');
    } else {
      bindingColumn = this.graphForm.get('selectedXColumnValue').value;

      this.matricArr = !bindingColumn.isNumber
        ? this.defaultMatricValues.filter((f: any) => f.isNumber || f.key == "None")
        : this.defaultMatricValues;
      if ([3, 4].includes(this.selectedGraphType.id)) {
        this.matricArr = this.matricArr.filter((item: any) => item.value !== 'Sum');
      }
      this.graphForm.get('matricFunction')?.setValue('');
    }
  }

  getMatricOperationValue(): void {
    if (this.isCard) {
      this.cardSetupForm.markAllAsTouched();
      if (!this.cardSetupForm.valid) return;
    }
    if (
      this.dataSource &&
      this.cardSetupForm.get('bindingColumn').value &&
      this.cardSetupForm.get('matricFunction').value
    ) {
      let payload = {
        dataSource: this.dataSource,
        bindingColumn: this.cardSetupForm.get('bindingColumn').value.name,
        matricFunction: this.cardSetupForm.get('matricFunction').value,
        filters: this.dataTablefilters ? this.dataTablefilters : [],
      };
      this.dataService
        .getMatricOperationValue(payload)
        .subscribe((response) => {
          this.bindingColumnValue = response.data;
        });
    }
  }

  displayAggregate(value: string): string {
    if (value === 'Count') {
      return 'Total Count';
    } else if (value === 'Sum') {
      return 'Total';
    } else if (value === 'Min') {
      return 'Minimum';
    } else if (value === 'Max') {
      return 'Maximum';
    } else if (value === 'Avg') {
      return 'Average';
    }
    return '';
  }

  onResize(event: NzResizeEvent, column: any): void {
    let width = event.width;
    console.log('tableDataColumns', column.width);
    let item = this.tableDataColumns.find((e) => e.name === column.name);
    item.width = `${width}px`;
    console.log('width', item.width);
  }

  drop(event: any): void {
    if (this.filteredHeaders.length) {
      if (event.previousContainer === event.container) {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
      this.tableDataColumns = this.tableDataColumns.map((item) => {
        item.default = true;
        return item;
      });
      const reorderedFilteredHeaders = this.filteredHeaders.sort((a, b) => {
        const indexA = this.tableDataColumns.findIndex(
          (col) => col.name === a.name
        );
        const indexB = this.tableDataColumns.findIndex(
          (col) => col.name === b.name
        );
        return indexA - indexB;
      });
      this.filteredHeaders = reorderedFilteredHeaders;
      this.tableDataColumns.forEach((col) => {
        const correspondingHeader = this.filteredHeaders.find(
          (header) => header.name === col.name
        );
        if (correspondingHeader) {
          col.default = correspondingHeader.checked;
        }
      });
      this.cdr.markForCheck();
    }
  }

  exportData() {
    this.downloadLoading = true;
    let payload: ExportRequest = {
      DataSource: this.dataSource,
      Filters: [],
    };
    this.dataService.getCsv(payload).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = `${this.dataSource}.csv`;
        link.click();
      },
      (error) => {
        this.downloadLoading = false;
        console.log(error, 'download error');
        this.notification.error(
          'error',
          'Something went wrong while downloading the file.'
        );
      },
      () => {
        this.downloadLoading = false;
      }
    );
  }

  onPropertyValueChange(event: any, property: string) {
    const value =
      typeof event?.color?.originalInput !== 'undefined'
        ? event.color.originalInput
        : +event.target?.value || event;
    if (this.chartRenders.length > 0) {
      const updatedDatasets = this.chartRenders[0].data.datasets.map(
        (dataset: any) => ({
          ...dataset,
          [property]:
            property === 'borderDash' || property === 'hoverBorderDash'
              ? [value]
              : value,
        })
      );
      this.chartRenders[0] = {
        ...this.chartRenders[0],
        data: {
          ...this.chartRenders[0].data,
          datasets: updatedDatasets,
        },
      };
    }
    if (property === 'borderDash' || property === 'hoverBorderDash') {
      this.styleForm.get(property)?.setValue([value]);
    }
  }

  onLegendChange(event: any, property: string): void {
    const value = event?.target?.value ? +event.target.value : event;
    if (this.chartRenders.length > 0) {
      const updatedOptions = {
        ...this.chartRenders[0].options,
        plugins: {
          ...this.chartRenders[0].options.plugins,
          legend: {
            ...this.chartRenders[0].options.plugins.legend,
            labels: {
              ...this.chartRenders[0].options.plugins.legend.labels,
              font: {
                ...this.chartRenders[0].options.plugins.legend.labels.font,
                [property]: value,
              },
            },
          },
        },
      };
      this.chartRenders[0] = {
        ...this.chartRenders[0],
        options: updatedOptions,
      };
    }
  }

  onLegendDisplayChange(event: any, property: string): void {
    const value = event?.target?.value ? +event.target.value : event;
    if (this.chartRenders.length > 0) {
      const updatedOptions = {
        ...this.chartRenders[0].options,
        plugins: {
          ...this.chartRenders[0].options.plugins,
          legend: {
            ...this.chartRenders[0].options.plugins.legend,
            [property]: value,
          },
        },
      };
      this.chartRenders[0] = {
        ...this.chartRenders[0],
        options: updatedOptions,
      };
    }
  }

  onTooltipChange(event: any, property: string): void {
    const value = event?.target?.value ? +event.target.value : event;
    if (this.chartRenders.length > 0) {
      const updatedOptions = {
        ...this.chartRenders[0].options,
        plugins: {
          ...this.chartRenders[0].options.plugins,
          tooltip: {
            ...this.chartRenders[0].options.plugins.tooltip,
            bodyFont: {
              ...this.chartRenders[0].options.plugins.tooltip.bodyFont,
              [property]: value,
            },
          },
        },
      };
      this.chartRenders[0] = {
        ...this.chartRenders[0],
        options: updatedOptions,
      };
    }
  }

  onScaleChange(event: any, property: string, axis: string): void {
    const value = event?.target?.value ? +event.target.value : event;
    if (this.chartRenders.length > 0) {
      let updatedOptions = {}
      if (property === 'beginAtZero' || property === 'display') {
        updatedOptions = {
          ...this.chartRenders[0].options,
          scales: {
            ...this.chartRenders[0].options.scales,
            [axis]: {
              ...this.chartRenders[0].options.scales?.[axis],
              [property]: value
            }
          }
        };
      } else {
        updatedOptions = {
          ...this.chartRenders[0].options,
          scales: {
            ...this.chartRenders[0].options.scales,
            [axis]: {
              ...this.chartRenders[0].options.scales?.[axis],
              ticks: {
                ...this.chartRenders[0].options.scales?.[axis]?.ticks,
                [property]: value
              }
            }
          }
        };
      }
      this.chartRenders[0] = {
        ...this.chartRenders[0],
        options: updatedOptions,
      };
    }
  }
}