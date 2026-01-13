import { rootRender } from './core';

import Component from '../../../fixture/reona-x';
rootRender(document.getElementById('root')!, Component, { value: 123 });
