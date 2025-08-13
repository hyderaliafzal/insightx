import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphService } from '../shared/services/graph.service';
import { Graph } from '../Models/graph';
import { ApiResponse } from 'src/app/Models/api-response';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SharedModule } from "../shared/shared.module";


@Component({
  selector: 'app-saved-graph',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './saved-graph.component.html',
  styleUrl: './saved-graph.component.scss',
})
export class SavedGraphComponent implements OnInit {
  graphs: Graph[] = [];
  isVisibleDeleteConfirmation = false;
  deleteId: number = 0;
  deleteGraphName: string = '';
  confirmationInput: string = '';
  constructor(private graphService: GraphService,
    private notification: NzNotificationService,
    private router: Router) { }

  ngOnInit() {
    this.getAllGraphs();
  }

  getAllGraphs() {
    this.graphService.getAllGraphs().subscribe((response: ApiResponse<Graph[]>) => {
      if (response.success) {
        this.graphs = [];
        this.graphs = response.data;
      }
    });
  }

  editGraph(id: number) {
    this.router.navigate(["/graph", id]);
  }

  deleteGraph() {
      this.graphService.deleteGraph(this.deleteId).subscribe((response: ApiResponse<any>) => {
        if (!response.success) {
          this.notification.error('Error', response.message, { nzDuration: 3000 });
          return;
        }
        this.getAllGraphs();
        this.notification.success('Success', response.message, { nzDuration: 3000 });
      });
  }

  openDeleteConfirmationModal(graph: any) {
    this.deleteId = graph.id;
    this.deleteGraphName = graph.name;
    this.isVisibleDeleteConfirmation = true;
  }

  closeDeleteConfirmationModal() {
    this.isVisibleDeleteConfirmation = false;
    this.deleteId = 0;
    this.deleteGraphName = '';
    this.confirmationInput = '';
  }
}