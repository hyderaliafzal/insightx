import { Component, OnInit } from '@angular/core';
import interact from 'interactjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { GraphService } from '../shared/services/graph.service';
import { DataService } from '../shared/services/data.service';
import { DashboardService } from '../shared/services/dashboard.service';
import { Graph } from '../Models/graph';
import { ApiResponse } from 'src/app/Models/api-response';
import { DashboardGraphRenderDetails } from '../Models/dashboad-graph-render-details';
import { DashboardSaveRequest } from '../Models/dashboard-request';
import { DashboardGraphSaveRequest } from '../Models/dashboard-graph-request';
import { KeyValueData } from '../Models/key-value';
import { ChartOptions } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardResponse } from '../Models/dashboard-response';
import { DashboardGraphResponse } from '../Models/dashboard-graph-response';
import { SidebarService } from '../shared/services/sidebar.Service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard-graph',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  graphs: Graph[] = [];
  chartRenders: any[] = [];
  activeTab = 'charts';
  dashboardForm!: FormGroup;
  isVisible = false;
  isVisibleEmbedGraph = false;
  isVisibleDeleteConfirmation = false;
  recordId: number = 0;
  confirmationInput: string = '';
  embedUrl: string = '';
  iFrameUrl: SafeHtml = '';
  constructor(
    private graphService: GraphService,
    config: NgbModalConfig,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private notification: NzNotificationService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private sidebarService: SidebarService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    config.centered = true;
  }

  ngOnInit(): void {
    this.initDashboardForm();
    this.getAllGraphs();
    this.setupInteract();

    this.route.params.subscribe((params) => {
      this.recordId = isNaN(+params['id']) ? 0 : Number(+params['id']);
      this.editDashboard(this.recordId);
    });
  }

  editDashboard(id: number) {
    if (id > 0) {
      this.chartRenders = [];
      this.dashboardService
        .getById(id)
        .subscribe((response: ApiResponse<DashboardResponse>) => {
          if (response.success) {
            this.setDashboardFormValues(response.data.id, response.data.name);

            Array.from(response.data.dashboardGraphs).forEach(
              (dashboardGraph: DashboardGraphResponse) => {
                let details: DashboardGraphRenderDetails = {
                  uid: this.generateUniqueId(),
                  id: dashboardGraph.id,
                  graphId: dashboardGraph.graph.id,
                  graphTitle: dashboardGraph.graph.name,
                  graphTypeName: dashboardGraph.graph.graphType?.type as string,
                  dataSource: dashboardGraph.graph.dataSource,
                  XColumnName: dashboardGraph.graph.graphColumns[0].name,
                  YColumnName:
                    dashboardGraph.graph.graphColumns.length > 1
                      ? dashboardGraph.graph.graphColumns[1].name
                      : '',
                  graphTableFilters: dashboardGraph.graph.graphTableFilters,
                  graphStyling: dashboardGraph.graph.graphStyling,
                  x: dashboardGraph.x,
                  y: dashboardGraph.y,
                  matricFunction: dashboardGraph.graph.matricFunction,
                  height: dashboardGraph.height,
                  width: dashboardGraph.width,
                };
                this.getGraphAndGraphData(details);
              }
            );
          }
        });
    }
  }

  initDashboardForm() {
    this.dashboardForm = this.formBuilder.group({
      id: 0,
      name: [null, Validators.required],
    });
  }

  setDashboardFormValues(id: number, name: string) {
    this.dashboardForm.setValue({
      id: id,
      name: name,
    });
  }

  setupInteract() {
    interact('.resizable-draggable')
      .draggable({ listeners: { move: this.moveListener } })
      .resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        listeners: { move: this.resizeListener },
        modifiers: [
          interact.modifiers.restrictEdges({ outer: 'parent' }),
          interact.modifiers.restrictSize({ min: { width: 240, height: 240 } }),
        ],
      });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getAllGraphs() {
    this.graphService
      .getAllGraphs()
      .subscribe((response: ApiResponse<Graph[]>) => {
        if (response.success) this.graphs = response.data;
      });
  }

  selectGraph(graph: Graph) {
    if (graph.id > 0) {
      this.graphService
        .getGraphById(graph.id)
        .subscribe((response: ApiResponse<Graph>) => {
          if (response.success) {
            const {
              id,
              name,
              graphType,
              dataSource,
              graphColumns,
              graphTableFilters,
              graphStyling
            } = response.data;
            const details: DashboardGraphRenderDetails = {
              uid: this.generateUniqueId(),
              id: 0,
              graphId: graph.id,
              graphTitle: name,
              graphTypeName: graphType?.type as string,
              dataSource,
              XColumnName: graphColumns[0].name,
              YColumnName: graphColumns.length > 1 ? graphColumns[1].name : '',
              matricFunction: response.data.matricFunction,
              graphTableFilters: graphTableFilters,
              x: 0,
              y: 0,
              height: 240,
              width: 240,
              graphStyling: graphStyling
            };
            this.getGraphAndGraphData(details);
          }
        });
    }
  }

  getGraphAndGraphData(details: DashboardGraphRenderDetails) {
    const data: { labels: string[]; datasets: any[]; options: ChartOptions } = {
      labels: [],
      datasets: [],
      options: {},
    };
    if (details.XColumnName) {
      if (['doughnut', 'pie'].includes(details.graphTypeName)) {
        this.dataService
          .getDataForGraph(
            details.dataSource,
            details.XColumnName,
            null,
            details.matricFunction,
            details.graphTableFilters
          )
          .subscribe(
            (response: ApiResponse<Array<KeyValueData>>) => {
              if (response.success) {
                data.datasets.push({
                  label: details.XColumnName,
                  data: response.data.map((m) => m.value),
                  backgroundColor: details.graphStyling[0]?.backgroundColor ? details.graphStyling[0]?.backgroundColor : '',
                  borderAlign: details.graphStyling[0]?.borderAlign ? details.graphStyling[0]?.borderAlign : 'center',
                  borderColor: details.graphStyling[0]?.borderColor ? details.graphStyling[0]?.borderColor : '',
                  borderDash: details.graphStyling[0]?.borderDash ? details.graphStyling[0]?.borderDash : [],
                  borderDashOffset: details.graphStyling[0]?.borderDashOffset ? details.graphStyling[0]?.borderDashOffset : 0.0,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle ? details.graphStyling[0]?.borderJoinStyle : undefined,
                  borderRadius: details.graphStyling[0]?.borderRadius !== "" ? details.graphStyling[0]?.borderRadius : 0,
                  borderWidth: details.graphStyling[0]?.borderWidth !== "" ? details.graphStyling[0]?.borderWidth : 2,
                  offset: details.graphStyling[0]?.offset !== "" ? details.graphStyling[0]?.offset : 0,
                  rotation: details.graphStyling[0]?.rotation ? details.graphStyling[0]?.rotation : undefined,
                  spacing: details.graphStyling[0]?.spacing !== "" ? details.graphStyling[0]?.spacing : 0,
                  weight: details.graphStyling[0]?.weight !== "" ? details.graphStyling[0]?.weight : 1,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor ? details.graphStyling[0]?.hoverBackgroundColor : '',
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor ? details.graphStyling[0]?.hoverBorderColor : '',
                  hoverBorderDash: details.graphStyling[0]?.hoverBorderDash ? details.graphStyling[0]?.hoverBorderDash : [],
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset !== "" ? details.graphStyling[0]?.hoverBorderDashOffset : 0,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle ? details.graphStyling[0]?.hoverBorderJoinStyle : '',
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth !== "" ? details.graphStyling[0]?.hoverBorderWidth : 1,
                  hoverOffset: details.graphStyling[0]?.hoverOffset !== "" ? details.graphStyling[0]?.hoverOffset : 0,

                });
                this.setGraphConfiguration(details, data);
              }
            },
            (error) => this.notification.error('Error', error.message)
          );
      } else if (details.graphTypeName === 'bar') {
        this.dataService
          .getDataForGraph(
            details.dataSource,
            details.XColumnName,
            details.YColumnName,
            details.matricFunction,
            details.graphTableFilters
          )
          .subscribe(
            (response: ApiResponse<Array<KeyValueData>>) => {
              if (response.success) {
                data.labels = response.data.map((m) => m.label) as string[];
                data.datasets.push({
                  label: details.YColumnName,
                  data: response.data.map((m) => m.value),
                  backgroundColor: details.graphStyling[0]?.backgroundColor ? details.graphStyling[0]?.backgroundColor : '',
                  barPercentage: details.graphStyling[0]?.barPercentage !== "" ? details.graphStyling[0]?.barPercentage : 0.9,
                  barThickness: details.graphStyling[0]?.barThickness !== "" ? details.graphStyling[0]?.barThickness : 1,
                  borderColor: details.graphStyling[0]?.borderColor ? details.graphStyling[0]?.borderColor : '',
                  borderSkipped: details.graphStyling[0]?.borderSkipped ? details.graphStyling[0]?.borderSkipped : 'start',
                  borderWidth: details.graphStyling[0]?.borderWidth !== "" ? details.graphStyling[0]?.borderWidth : 1,
                  borderRadius: details.graphStyling[0]?.borderRadius !== "" ? details.graphStyling[0]?.borderRadius : 0,
                  categoryPercentage: details.graphStyling[0]?.categoryPercentage !== "" ? details.graphStyling[0]?.categoryPercentage : 0.8,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor ? details.graphStyling[0]?.hoverBackgroundColor : '',
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor ? details.graphStyling[0]?.hoverBorderColor : '',
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth !== "" ? details.graphStyling[0]?.hoverBorderWidth : 1,
                  hoverBorderRadius: details.graphStyling[0]?.hoverBorderRadius !== "" ? details.graphStyling[0]?.hoverBorderRadius : 0,
                  pointStyle: details.graphStyling[0]?.pointStyle ? details.graphStyling[0]?.pointStyle : 'circle',
                  maxBarThickness: details.graphStyling[0]?.maxBarThickness !== "" ? details.graphStyling[0]?.maxBarThickness : 1,
                  minBarLength: details.graphStyling[0]?.minBarLength !== "" ? details.graphStyling[0]?.minBarLength : 1,
                });
                this.setGraphConfiguration(details, data);
              } else {
                this.notification.error('Error', response.message);
              }
            },
            (error) => this.notification.error('Error', error.message)
          );
      } else if (details.graphTypeName === 'line') {
        this.dataService
          .getDataForGraph(
            details.dataSource,
            details.XColumnName,
            details.YColumnName,
            details.matricFunction,
            details.graphTableFilters
          )
          .subscribe(
            (response: ApiResponse<Array<KeyValueData>>) => {
              if (response.success) {
                data.labels = response.data.map((m) => m.label) as string[];
                data.datasets.push({
                  label: details.YColumnName,
                  data: response.data.map((m) => m.value),
                  backgroundColor: details.graphStyling[0]?.backgroundColor ? details.graphStyling[0]?.backgroundColor : '',
                  borderCapStyle: details.graphStyling[0]?.borderCapStyle ? details.graphStyling[0]?.borderCapStyle : 'butt',
                  borderColor: details.graphStyling[0]?.borderColor ? details.graphStyling[0]?.borderColor : '',
                  borderDash: details.graphStyling[0]?.borderDash ? details.graphStyling[0]?.borderDash : [],
                  fill: details.graphStyling[0]?.fill ? details.graphStyling[0]?.fill : false,
                  tension: details.graphStyling[0]?.tension ? details.graphStyling[0]?.tension : 0,
                  borderDashOffset: details.graphStyling[0]?.borderDashOffset !== "" ? details.graphStyling[0]?.borderDashOffset : 0.0,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle ? details.graphStyling[0]?.borderJoinStyle : undefined,
                  borderWidth: details.graphStyling[0]?.borderWidth !== "" ? details.graphStyling[0]?.borderWidth : 2,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor ? details.graphStyling[0]?.hoverBackgroundColor : '',
                  hoverBorderCapStyle: details.graphStyling[0]?.hoverBorderCapStyle ? details.graphStyling[0]?.hoverBorderCapStyle : undefined,
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor ? details.graphStyling[0]?.hoverBorderColor : undefined,
                  hoverBorderDash: details.graphStyling[0]?.hoverBorderDash ? details.graphStyling[0]?.hoverBorderDash : undefined,
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset ? details.graphStyling[0]?.hoverBorderDashOffset : undefined,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle ? details.graphStyling[0]?.hoverBorderJoinStyle : undefined,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth ? details.graphStyling[0]?.hoverBorderWidth : undefined,
                  pointBackgroundColor: details.graphStyling[0]?.pointBackgroundColor ? details.graphStyling[0]?.pointBackgroundColor : '',
                  pointBorderColor: details.graphStyling[0]?.pointBorderColor ? details.graphStyling[0]?.pointBorderColor : '',
                  pointBorderWidth: details.graphStyling[0]?.pointBorderWidth !== "" ? details.graphStyling[0]?.pointBorderWidth : 1,
                  pointHitRadius: details.graphStyling[0]?.pointHitRadius !== "" ? details.graphStyling[0]?.pointHitRadius : 1,
                  pointHoverBackgroundColor: details.graphStyling[0]?.pointHoverBackgroundColor ? details.graphStyling[0]?.pointHoverBackgroundColor : undefined,
                  pointHoverBorderColor: details.graphStyling[0]?.pointHoverBorderColor ? details.graphStyling[0]?.pointHoverBorderColor : undefined,
                  pointHoverBorderWidth: details.graphStyling[0]?.pointHoverBorderWidth !== "" ? details.graphStyling[0]?.pointHoverBorderWidth : 1,
                  pointHoverRadius: details.graphStyling[0]?.pointHoverRadius !== "" ? details.graphStyling[0]?.pointHoverRadius : 4,
                  pointRadius: details.graphStyling[0]?.pointRadius !== "" ? details.graphStyling[0]?.pointRadius : 3,
                  pointRotation: details.graphStyling[0]?.pointRotation !== "" ? details.graphStyling[0]?.pointRotation : 0,
                  pointStyle: details.graphStyling[0]?.pointStyle ? details.graphStyling[0]?.pointStyle : 'circle',
                });
                this.setGraphConfiguration(details, data);
              } else {
                this.notification.error('Error', response.message);
              }
            },
            (error) => this.notification.error('Error', error.message)
          );
      } else if (details.graphTypeName === 'scatter') {
        this.dataService
          .getDataForGraph(
            details.dataSource,
            details.XColumnName,
            details.YColumnName,
            details.matricFunction,
            details.graphTableFilters
          )
          .subscribe(
            (response: ApiResponse<Array<KeyValueData>>) => {
              if (response.success) {
                data.labels = response.data.map((m) => m.label) as string[];
                data.datasets.push({
                  label: details.YColumnName,
                  data: response.data.map((m) => m.value),
                  backgroundColor: details.graphStyling[0]?.backgroundColor ? details.graphStyling[0]?.backgroundColor : '',
                  borderColor: details.graphStyling[0]?.borderColor ? details.graphStyling[0]?.borderColor : '',
                  borderWidth: details.graphStyling[0]?.borderWidth !== "" ? details.graphStyling[0]?.borderWidth : 2,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor ? details.graphStyling[0]?.hoverBackgroundColor : '',
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor ? details.graphStyling[0]?.hoverBorderColor : undefined,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth ? details.graphStyling[0]?.hoverBorderWidth : undefined,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle ? details.graphStyling[0]?.borderJoinStyle : undefined,
                  hoverBorderCapStyle: details.graphStyling[0]?.hoverBorderCapStyle ? details.graphStyling[0]?.hoverBorderCapStyle : undefined,
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset ? details.graphStyling[0]?.hoverBorderDashOffset : undefined,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle ? details.graphStyling[0]?.hoverBorderJoinStyle : undefined,
                  pointBackgroundColor: details.graphStyling[0]?.pointBackgroundColor ? details.graphStyling[0]?.pointBackgroundColor : '',
                  pointBorderColor: details.graphStyling[0]?.pointBorderColor ? details.graphStyling[0]?.pointBorderColor : '',
                  pointBorderWidth: details.graphStyling[0]?.pointBorderWidth !== "" ? details.graphStyling[0]?.pointBorderWidth : 1,
                  pointRadius: details.graphStyling[0]?.pointRadius !== "" ? details.graphStyling[0]?.pointRadius : 3,
                  pointHoverBackgroundColor: details.graphStyling[0]?.pointHoverBackgroundColor ? details.graphStyling[0]?.pointHoverBackgroundColor : undefined,
                  pointHoverBorderColor: details.graphStyling[0]?.pointHoverBorderColor ? details.graphStyling[0]?.pointHoverBorderColor : undefined,
                  pointHoverBorderWidth: details.graphStyling[0]?.pointHoverBorderWidth !== "" ? details.graphStyling[0]?.pointHoverBorderWidth : 1,
                  pointHoverRadius: details.graphStyling[0]?.pointHoverRadius !== "" ? details.graphStyling[0]?.pointHoverRadius : 4,
                  pointStyle: details.graphStyling[0]?.pointStyle ? details.graphStyling[0]?.pointStyle : 'circle',
                });
                this.setGraphConfiguration(details, data);
              } else {
                this.notification.error('Error', response.message);
              }
            },
            (error) => this.notification.error('Error', error.message)
          );
      }
    }
  }

  setGraphConfiguration(
    details: DashboardGraphRenderDetails,
    data: { labels: string[]; datasets: any[]; options: ChartOptions }
  ) {
    this.chartRenders.push({
      id: details.id,
      uid: details.uid,
      graphId: details.graphId,
      x: details.x,
      y: details.y,
      height: details.height,
      width: details.width,
      type: details.graphTypeName,
      data,
      options: {
        plugins: {
          title: {
            display: true,
            text: details.graphTitle,
            align: 'start',
            font: {
              size: 20
            }
          },
          legend: {
            display: details.graphStyling[0]?.isLegendShow,
            labels: {
              font: {
                family: details.graphStyling[0]?.legendFontFamily || 'Arial',
                size: details.graphStyling[0]?.legendFontSize || 12,
                weight: details.graphStyling[0]?.legendFontWeight || 'normal',
                style: details.graphStyling[0]?.legendFontStyle || 'normal',
              },
            },
          },
          tooltip: {
            bodyFont: {
              family: details.graphStyling[0]?.tooltipFontFamily || 'Arial',
              size: details.graphStyling[0]?.tooltipFontSize || 12,
              weight: details.graphStyling[0]?.tooltipFontWeight || 'normal',
              style: details.graphStyling[0]?.tooltipFontStyle || 'normal',
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: details.graphStyling[0]?.isXAxisShow,
            beginAtZero: details.graphStyling[0]?.beginAtZeroX, grid: { display: false },
            ...(!['doughnut', 'pie'].includes(details.graphTypeName)
              ? {
                ticks: {
                  stepSize: details.graphStyling[0]?.stepSizeX,
                  min: details.graphStyling[0]?.minX,
                  max: details.graphStyling[0]?.maxX,
                },
              }
              : {}),
          },
          y: {
            display: details.graphStyling[0]?.isYAxisShow,
            beginAtZero: details.graphStyling[0]?.beginAtZeroY, grid: { display: false },
            ...(!['doughnut', 'pie'].includes(details.graphTypeName)
              ? {
                ticks: {
                  stepSize: details.graphStyling[0]?.stepSizeY,
                  min: details.graphStyling[0]?.minY,
                  max: details.graphStyling[0]?.maxY,
                },
              }
              : {}),
          },
        },
        elements: {
          point: { radius: 0 },
          line: { borderWidth: 1 },
        },
      },
    });
  }

  moveListener(event: any) {
    const target = event.target;
    const gridSize = 5; // Same as the grid size in SCSS / 2
    const parentRect = document
      .querySelector('.dashboard-canvas')!
      .getBoundingClientRect();

    // Get current position
    let x = (parseFloat(target.getAttribute('data-x')!) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')!) || 0) + event.dy;

    // Boundary checks
    x = Math.max(0, Math.min(x, parentRect.width - target.offsetWidth));
    y = Math.max(0, Math.min(y, parentRect.height - target.offsetHeight));

    // Snap to grid
    let snapX = Math.round(x / gridSize) * gridSize;
    let snapY = Math.round(y / gridSize) * gridSize;

    // Apply transform
    target.style.transform = `translate(${snapX}px, ${snapY}px)`;

    // Update position attributes
    target.setAttribute('data-x', snapX.toString());
    target.setAttribute('data-y', snapY.toString());
  }

  resizeListener(event: any) {
    const target = event.target;
    const gridSize = 20; // Same as the grid size in SCSS / 2

    // Snap width and height to the nearest grid size
    const x = Math.round(event.rect.width / gridSize) * gridSize;
    const y = Math.round(event.rect.height / gridSize) * gridSize;

    target.style.width = `${x}px`;
    target.style.height = `${y}px`;
  }

  openDashboardModal() {
    this.isVisible = true;
  }

  closeDashboardModal() {
    this.isVisible = false;
  }

  openEmbedGraphModal() {
    this.saveDashboard();
    this.isVisibleEmbedGraph = true;
    const token = localStorage.getItem('token');
    this.embedUrl = window.location.origin + `/embed/${this.recordId}` + '?token=' + token;
    this.iFrameUrl = `<iframe id="embedd-dashboard" src=${this.embedUrl} frameborder="0" width="100%" height="100%"></iframe>`;
  }

  closeEmbedGraphModal() {
    this.isVisibleEmbedGraph = false;
    this.embedUrl = '';
    this.iFrameUrl = '';
  }

  openDeleteConfirmationModal() {
    this.isVisibleDeleteConfirmation = true;
  }

  closeDeleteConfirmationModal() {
    this.isVisibleDeleteConfirmation = false;
    this.confirmationInput = '';
  }

  saveDashboard() {
    const allCharts = document.getElementsByClassName('resizable-draggable');
    this.dashboardForm.markAllAsTouched();
    if (!this.dashboardForm.valid) return;
    if (allCharts.length === 0) {
      this.notification.warning(
        'Warning',
        'No graphs have been added to the dashboard.'
      );
      return;
    }

    const dashboardGraphs: DashboardGraphSaveRequest[] = Array.from(allCharts)
      .map((element) => {
        const uid = Number(
          (element.querySelector("input[type='hidden']") as HTMLInputElement)
            ?.value
        );
        const x = parseFloat(element.getAttribute('data-x')!) || 0;
        const y = parseFloat(element.getAttribute('data-y')!) || 0;
        const width = element.clientWidth;
        const height = element.clientHeight;
        const dashboardGraph = this.chartRenders.find(
          (render) => render.uid === uid
        );
        return {
          id: dashboardGraph?.id,
          graphId: dashboardGraph?.graphId,
          height,
          width,
          x,
          y,
        };
      })
      .filter(Boolean) as DashboardGraphSaveRequest[];
    const payload: DashboardSaveRequest = {
      id: this.recordId > 0 ? this.recordId : 0,
      name: this.dashboardForm.value.name,
      dashboardGraphs,
    };

    this.dashboardService
      .saveDashboard(payload)
      .subscribe((response: ApiResponse<null>) => {
        if (response.success) {
          this.closeDashboardModal();
          this.notification.success('Success', response.message);
          this.sidebarService.loadSidebarData();
        }
      });
  }

  deleteChart(uid: number): void {
    const index = this.chartRenders.findIndex((render) => render.uid === uid);
    if (index > -1) {
      this.chartRenders.splice(index, 1);
      this.chartRenders = [...this.chartRenders];
    }
  }

  deleteDashboard() {
    if (this.recordId > 0) {
      this.dashboardService.delete(this.recordId).subscribe((response) => {
        if (response.success) {
          this.notification.success(
            'Success',
            'Successfully deleted dashboard'
          );
          this.sidebarService.loadSidebarData();
          this.router.navigate(['']);
        } else {
          this.notification.error('Error', response.message);
        }
      });
    } else {
      this.notification.warning('Warning', 'No dashboard selected to delete');
    }
  }

  closeDeleteConfirmation() {
    this.isVisibleDeleteConfirmation = false;
  }

  generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 1000000);
  }

  routeToEmbedGraph() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(["/embed", this.recordId], { queryParams: { token } });
    } else {
      console.error('Token not found in localStorage');
    }
  }

  copyToClipboard(text: any) {
    if (!document.hasFocus()) {
      window.focus();
    }
    navigator.clipboard.writeText(text).then(() => {
    }).catch(err => {
      console.error('Failed to copy!', err);
    });
  }
}