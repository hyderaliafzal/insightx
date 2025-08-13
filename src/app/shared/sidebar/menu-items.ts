import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    icon: 'assets/images/icons/dashboardIcon1.svg',
    class: '',
    extralink: false,
    dropdown: true,
    submenu: [],
  },
  {
    path: 'saved-graphs',
    title: 'Saved Graphs',
    icon: 'assets/images/icons/saveedChartIcon.svg',
    class: '',
    extralink: false,
    dropdown: false,
    submenu: [],
  },
  {
    path: 'graph',
    title: 'Add New Graph',
    icon: 'assets/images/icons/addChartIcon1.svg',
    class: '',
    extralink: false,
    dropdown: false,
    submenu: [],
  },
  {
    path: 'data-merge',
    title: 'Data Merge',
    icon: 'assets/images/icons/data-transfer.svg',
    class: '',
    extralink: false,
    dropdown: true,
    submenu: [
      {
        path: 'list',
        title: 'List',
        icon: 'assets/images/icons/List.svg',
        class: '',
        extralink: false,
        dropdown: false,
        submenu: [],
      }
    ],
  },
];