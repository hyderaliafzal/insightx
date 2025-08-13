import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DataMergeService } from '../shared/services/datamerge.service';
import { ApiResponse } from '../Models/api-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @ViewChild('listTable', { static: true }) listTable!: any;
  dataList: any = [];
  isVisibleDeleteConfirmation = false;
  isVisibleFilterModal = false;
  deleteListId: number = 0;
  deleteListName: string = '';
  confirmationInput: string = '';
  page = 1;
  pageSize = 15;
  loading = false;
  totalTableItems = 0;

  constructor(
    private notification: NzNotificationService,
    private dataMergeService: DataMergeService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getAllDataMerge(this.page, this.pageSize);
  }

  ngAfterViewInit(): void {
    const scrollContainer = this.listTable.elementRef.nativeElement.querySelector('.ant-table-body');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  getAllDataMerge(page: number, pageSize: number, search?: string,) {
    this.loading = true;
    this.dataMergeService.getAllDataMerge(page, pageSize, search).subscribe(
      (repos) => {
        if (repos.success) {
          this.dataList = [...this.dataList, ...repos.data];
          this.totalTableItems = repos.total;
          this.loading = false;
        }
      },
      (err) => {
        console.error(err);
        this.notification.error('Error', err.message, { nzDuration: 3000 });
        this.loading = false;
      },
      (final: void) => { }
    );
  }

  editList(data: any) {
    this.router.navigate(["/data-merge/edit", data.id]);
  }

  deleteList() {
    this.dataMergeService.deleteDataMerge(this.deleteListId).subscribe((response: ApiResponse<any>) => {
      if (!response.success) {
        this.notification.error('Error', response.message, { nzDuration: 3000 });
        return;
      }
      this.notification.success('Success', response.message, { nzDuration: 3000 });
      this.closeDeleteConfirmationModal();
      this.page = 0;
      this.getAllDataMerge(this.page, this.pageSize);
    });
  }

  onSearch(event: any) {
    let search = event.target.value;
    this.page = 0;
    this.dataList = [];
    this.getAllDataMerge(this.page, this.pageSize, search);
  }

  openDeleteConfirmationModal(obj: any) {
    this.deleteListId = obj.id;
    this.deleteListName = obj.name;
    this.isVisibleDeleteConfirmation = true;
  }

  closeDeleteConfirmationModal() {
    this.deleteListId = 0;
    this.deleteListName = '';
    this.confirmationInput = '';
    this.isVisibleDeleteConfirmation = false;
  }

  onScroll(event: any): void {
    const target = event.target as HTMLElement;
    const bottom =
      target.scrollHeight - Math.ceil(target.scrollTop + target.clientHeight) <=
      1;
    if (
      bottom &&
      !this.loading &&
      this.dataList.length < this.totalTableItems
    ) {
      this.page++;
      this.getAllDataMerge(this.page, this.pageSize);
    }
  }
}