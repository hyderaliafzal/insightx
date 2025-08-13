import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartOptions, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'dashboard-chart',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-chart.component.html',
  styleUrls: ['./dashboard-chart.component.scss']
})
export class DashboardChartComponent implements AfterViewInit {
  @ViewChild('dashboardChartCanvas') dashboardChartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() type: ChartType = 'bar';
  @Input() data: any = {};
  @Input() options: ChartOptions = {};
  chart!: Chart;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    if (!this.dashboardChartCanvas) {
      return;
    }
    this.chart = new Chart(this.dashboardChartCanvas.nativeElement, {
      type: this.type,
      data: this.data,
      options: this.options
    });
  }
}