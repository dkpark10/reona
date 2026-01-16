import { rootRender } from "./core";
// import Todo from '../../../apps/todo/reona-x';
// import Tic from '../../../apps/tic-tac-toe/reona-x';
// import Counter from '../../../fixture/counter/reona-x';
import Store from '../../../fixture/store/reona-x';

rootRender(document.getElementById('root')!, Store);