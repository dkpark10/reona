import { rootRender } from './core';

import Counter from '../../../fixture/reona-x';
rootRender(document.getElementById('root')!, Counter, { value: 123 });

// import Store from '../../../fixture/store/reona-x';
// rootRender(document.getElementById('root')!, Store);

// import Refs from '../../../fixture/refs/reona-x';
// rootRender(document.getElementById('root')!, Refs);
