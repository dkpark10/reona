import { rootRender, createRouter, EnrollRouter } from "./core";
// import Todo from '../../../apps/todo/reona-x';
// import Tic from '../../../apps/tic-tac-toe/reona-x';
// import Counter from '../../../fixture/counter/reona-x';
// import Store from '../../../fixture/store/reona-x';
// import Array from '../../../fixture/array/reona-x';
import App from '../../../fixture/router';
import About from '../../../fixture/router/about';

const router = createRouter([
  { path: '/', component: App },
  { path: '/about', component: About },
]);

rootRender(document.getElementById('root')!, App);
