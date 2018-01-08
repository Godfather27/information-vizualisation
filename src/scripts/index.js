import * as d3 from 'd3';
import { barchartCreate, barchartUpdate } from './charts/barchart';
import { treechartCreate } from './charts/treechart';
import { bubbleChartCreate, bubbleChartUpdate } from './charts/bubblechart';

d3.json(`${window.location.href}assets/nrw_2017.json`, (error17, json17) => {
  const data17 = json17;
  d3.json(`${window.location.href}assets/nrw_2013.json`, (error13, json13) => {
    const data13 = json13;

    treechartCreate(data13, data17);
    barchartCreate();
    barchartUpdate(data13, data17, 'G90000');
    bubbleChartCreate();
    let i = 1;
    const testInterval = setInterval(() => {
      bubbleChartUpdate(data17, `G${i}0000`, 1); i += 1;
      if (i === 10) {
        clearInterval(testInterval);
      }
    }, 2000);
  });
});
