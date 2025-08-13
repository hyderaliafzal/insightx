import { CommonModule } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { NavigationComponent } from "src/app/shared/header/navigation.component";
import { SidebarComponent } from "src/app/shared/sidebar/sidebar.component";
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: "app-full-layout",
  standalone: true,
  imports: [RouterModule, SidebarComponent, NavigationComponent, CommonModule, NgbCollapseModule, SharedModule],
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit {
  isFolded: any = false;
  constructor(public router: Router) { }
  public isCollapsed = true;
  public innerWidth: number = 0;
  public defaultSidebar: string = "";
  public showMobileMenu = false;
  public expandLogo = false;
  public sidebartype = "full";
  onAddNewGraph = true;

  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  ngOnInit() {
    if (this.router.url === "/") {
      this.router.navigate(["/dashboard"]);
    }
    this.defaultSidebar = this.sidebartype;
    this.handleSidebar();
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.handleSidebar();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1170) {
      this.sidebartype = "full";
    } else {
      this.sidebartype = this.defaultSidebar;
    }
  }

  toggleSidebarType() {
    switch (this.sidebartype) {
      case "full":
        this.sidebartype = "mini-sidebar";
        break;
      case "mini-sidebar":
        this.sidebartype = "full";
        break;
      default:
    }
  }

  checkRoute(routeLink: any) {
    if (routeLink == '/new-chart') {
      this.onAddNewGraph = true;
    } else {
      this.onAddNewGraph = false;
    }
  }

  toggleSidebar(event: any){
    this.isFolded = event;
  }
}