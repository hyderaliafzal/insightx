import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartOptions, ChartType, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
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
    if (!this.chartCanvas) {
      return;
    }
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.type,
      data: this.data,
      options: this.options
    });
  }
}
