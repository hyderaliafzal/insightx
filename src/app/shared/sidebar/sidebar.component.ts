import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardService } from '../services/dashboard.service';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DashboardSaveRequest } from 'src/app/Models/dashboard-request';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SidebarService } from '../services/sidebar.Service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf, SharedModule, CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  showMenu: any;
  showSubMenu: any = '';
  isFolded: any = false;
  selectedItem: any;
  public sidebarnavItems: RouteInfo[] = [];
  showMenuPath: any;
  showSubMenuPath: any;
  showSubMenuName: any;
  // this is for the open close
  addExpandClass(element: any) {
    this.showMenu = element.title;
    if (element.submenu.length === 0) {
      let menu: any = this.sidebarnavItems.find((menu) => menu.title === "Dashboard");
      menu.dropdown ||= true;
      this.showSubMenu = '';
      this.showSubMenuName = '';
    } else {
      element.dropdown = !element.dropdown;
    }
  }

  addSubmenuExpandClass(element: string) {
    this.showSubMenu = element;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private notificationService: NzNotificationService,
    private sidebarService: SidebarService
  ) { }

  // End open close
  ngOnInit() {
    this.sidebarnavItems = ROUTES;
    this.sidebarService.getSidebarNavItems().subscribe((items: any) => {
      ROUTES[0].submenu = items;
    });
    this.setRouting();
  }
  setRouting() {
    const currentPath = this.router.url;
    const pathSegments = currentPath.split('/').filter(Boolean);
    this.showMenuPath = pathSegments[0];
    let showMenuItem: any = this.sidebarnavItems.find((menu: any) => menu.path === this.showMenuPath);
    this.showMenu = showMenuItem.title;
    if (pathSegments.length >= 2) {
      this.showSubMenuPath = isNaN(+pathSegments[1]) ? pathSegments[1] : +pathSegments[1];
      let menu: any = this.sidebarnavItems.find((menu) => menu.path === this.showMenuPath);
      let submenu = menu?.submenu?.find((submenu: any) => submenu.path === this.showSubMenuPath)
      this.showSubMenu = submenu?.path;
      this.showSubMenuName = submenu?.title;
      if (submenu) {
        menu.dropdown = !menu.dropdown;
      }
    }
  }

  onRouteClick(path: string) {
    console.log('path', path);
  }

  isImage(icon: string): boolean {
    return (
      icon.endsWith('.png') ||
      icon.endsWith('.jpg') ||
      icon.endsWith('.jpeg') ||
      icon.endsWith('.gif') ||
      icon.startsWith('assets/')
    );
  }

  toggleSubmenu(sidebarnavItem: any) {
    sidebarnavItem.expanded = !sidebarnavItem.expanded;
  }

  routeToDashboard(menu: any, submenu: any) {
    this.router.navigate([menu.path, submenu.path]);
    this.addSubmenuExpandClass(submenu.path);
    this.showSubMenuName = submenu.title;
  }

  toggleFold() {
    this.isFolded = !this.isFolded;
    this.toggleSidebar.emit(this.isFolded);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sidebarnavItems[0].submenu, event.previousIndex, event.currentIndex);
    let payload = this.sidebarnavItems[0].submenu.map((m: any) => {
      return {
        id: m.path,
        name: m.title,
      };
    }) as DashboardSaveRequest[];
    this.dashboardService.updateSortOrder(payload).subscribe((response) => {
      if (!response.success)
        this.notificationService.error("Error - Change not save", response.message)
    });
  }
}