import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private titleService: Title, private router: Router) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const activeRoute = this.router.routerState.root;
        this.setTitle(activeRoute);
      });
  }

  private setTitle(route: ActivatedRoute) {
    const title = route.snapshot.data['title'] || 'Default Title';
    this.titleService.setTitle('ConnektaViz - ' + title);
    // Get the id from the route parameters if available
    const id = route.snapshot.params['id'];
    if (id) {
      const dynamicTitle = id ? `${title} ${id}` : title;
      this.titleService.setTitle('ConnektaViz - ' + dynamicTitle);
    }
    const name = route.snapshot.params['name'];
    if (name) {
      const dynamicTitle = name ? `${name}` : title;
      this.titleService.setTitle('ConnektaViz - ' + dynamicTitle);
    }
    // If you have child routes, you might want to check those too
    if (route.firstChild) {
      this.setTitle(route.firstChild);
    }
  }
}