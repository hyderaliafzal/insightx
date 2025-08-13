import { Component, OnInit } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DataService } from '../shared/services/data.service';
import { DashboardService } from '../shared/services/dashboard.service';
import { ApiResponse } from 'src/app/Models/api-response';
import { DashboardGraphRenderDetails } from '../Models/dashboad-graph-render-details';
import { KeyValueData } from '../Models/key-value';
import { ChartOptions } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { DashboardResponse } from '../Models/dashboard-response';
import { DashboardGraphResponse } from '../Models/dashboard-graph-response';
import { DashboardChartComponent } from '../dashboard-chart/dashboard-chart.component';

@Component({
  selector: 'app-embed-graph',
  standalone: true,
  imports: [SharedModule, DashboardChartComponent],
  templateUrl: './embed-graph.component.html',
  styleUrl: './embed-graph.component.scss'
})
export class EmbedGraphComponent implements OnInit {
  chartRenders: any[] = [];
  recordId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private dataService: DataService,
    private notification: NzNotificationService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      localStorage.setItem('token', token);
    });
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

  generateUniqueId() {
    return Date.now() + Math.floor(Math.random() * 1000000);
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
                  backgroundColor: details.graphStyling[0]?.backgroundColor,
                  borderAlign: details.graphStyling[0]?.borderAlign,
                  borderColor: details.graphStyling[0]?.borderColor,
                  borderDash: details.graphStyling[0]?.borderDash,
                  borderDashOffset: details.graphStyling[0]?.borderDashOffset,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle,
                  borderRadius: details.graphStyling[0]?.borderRadius,
                  borderWidth: details.graphStyling[0]?.borderWidth,
                  offset: details.graphStyling[0]?.offset,
                  rotation: details.graphStyling[0]?.rotation,
                  spacing: details.graphStyling[0]?.spacing,
                  weight: details.graphStyling[0]?.weight,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor,
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor,
                  hoverBorderDash: details.graphStyling[0]?.hoverBorderDash,
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth,
                  hoverOffset: details.graphStyling[0]?.hoverOffset,
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
                  backgroundColor: details.graphStyling[0]?.backgroundColor,
                  barPercentage: details.graphStyling[0]?.barPercentage,
                  barThickness: details.graphStyling[0]?.barThickness,
                  borderColor: details.graphStyling[0]?.borderColor,
                  borderSkipped: details.graphStyling[0]?.borderSkipped,
                  borderWidth: details.graphStyling[0]?.borderWidth,
                  borderRadius: details.graphStyling[0]?.borderRadius,
                  categoryPercentage: details.graphStyling[0]?.categoryPercentage,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor,
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth,
                  hoverBorderRadius: details.graphStyling[0]?.hoverBorderRadius,
                  pointStyle: details.graphStyling[0]?.pointStyle,
                  maxBarThickness: details.graphStyling[0]?.maxBarThickness,
                  minBarLength: details.graphStyling[0]?.minBarLength,
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
                  backgroundColor: details.graphStyling[0]?.backgroundColor,
                  borderCapStyle: details.graphStyling[0]?.borderCapStyle,
                  borderColor: details.graphStyling[0]?.borderColor,
                  borderDash: details.graphStyling[0]?.borderDash,
                  fill: details.graphStyling[0]?.fill,
                  tension: details.graphStyling[0]?.tension,
                  borderDashOffset: details.graphStyling[0]?.borderDashOffset,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle,
                  borderWidth: details.graphStyling[0]?.borderWidth,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor,
                  hoverBorderCapStyle: details.graphStyling[0]?.hoverBorderCapStyle,
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor,
                  hoverBorderDash: details.graphStyling[0]?.hoverBorderDash,
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth,
                  pointBackgroundColor: details.graphStyling[0]?.pointBackgroundColor,
                  pointBorderColor: details.graphStyling[0]?.pointBorderColor,
                  pointBorderWidth: details.graphStyling[0]?.pointBorderWidth,
                  pointHitRadius: details.graphStyling[0]?.pointHitRadius,
                  pointHoverBackgroundColor: details.graphStyling[0]?.pointHoverBackgroundColor,
                  pointHoverBorderColor: details.graphStyling[0]?.pointHoverBorderColor,
                  pointHoverBorderWidth: details.graphStyling[0]?.pointHoverBorderWidth,
                  pointHoverRadius: details.graphStyling[0]?.pointHoverRadius,
                  pointRadius: details.graphStyling[0]?.pointRadius,
                  pointRotation: details.graphStyling[0]?.pointRotation,
                  pointStyle: details.graphStyling[0]?.pointStyle,
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
                  backgroundColor: details.graphStyling[0]?.backgroundColor,
                  borderColor: details.graphStyling[0]?.borderColor,
                  borderWidth: details.graphStyling[0]?.borderWidth,
                  hoverBackgroundColor: details.graphStyling[0]?.hoverBackgroundColor,
                  hoverBorderColor: details.graphStyling[0]?.hoverBorderColor,
                  hoverBorderWidth: details.graphStyling[0]?.hoverBorderWidth,
                  borderJoinStyle: details.graphStyling[0]?.borderJoinStyle,
                  hoverBorderCapStyle: details.graphStyling[0]?.hoverBorderCapStyle,
                  hoverBorderDashOffset: details.graphStyling[0]?.hoverBorderDashOffset,
                  hoverBorderJoinStyle: details.graphStyling[0]?.hoverBorderJoinStyle,
                  pointBackgroundColor: details.graphStyling[0]?.pointBackgroundColor,
                  pointBorderColor: details.graphStyling[0]?.pointBorderColor,
                  pointBorderWidth: details.graphStyling[0]?.pointBorderWidth,
                  pointRadius: details.graphStyling[0]?.pointRadius,
                  pointHoverBackgroundColor: details.graphStyling[0]?.pointHoverBackgroundColor,
                  pointHoverBorderColor: details.graphStyling[0]?.pointHoverBorderColor,
                  pointHoverBorderWidth: details.graphStyling[0]?.pointHoverBorderWidth,
                  pointHoverRadius: details.graphStyling[0]?.pointHoverRadius,
                  pointStyle: details.graphStyling[0]?.pointStyle,
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

  deleteChart(uid: number): void {
    const index = this.chartRenders.findIndex((render) => render.uid === uid);
    if (index > -1) {
      this.chartRenders.splice(index, 1);
      this.chartRenders = [...this.chartRenders];
    }
  }

  trackByFn(item: any): string {
    return item.uid;
  }
}