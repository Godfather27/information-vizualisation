import * as d3 from 'd3';
import { bubbleChartUpdate } from './bubblechart';
import { currentGKZ } from './treechart';

let xscale;
let yscale;
let groupYAxis;
let groupXAxis;
let yAxis;
let xAxis;
let g;
const margin = {
  top: 40,
  bottom: 40,
  left: 80,
  right: 40,
};
const width = (window.innerWidth * 0.45) - margin.left - margin.right;
const height = (window.innerHeight / 2) - margin.top - margin.bottom;
const colors = {
  SPÖ: 0,
  ÖVP: 172,
  FPÖ: 235,
  GRÜNE: 120,
  NEOS: 306,
  KPÖ: 55,
  CPÖ: 36,
  M: 272,
  EUAUS: 69,
  SLP: 142,
};

function barchartCreate() {
  // Creates sources <svg> element
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  xscale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.5);
  yscale = d3.scaleLinear().range([height, 0]);

  xAxis = d3.axisBottom().scale(xscale);
  groupXAxis = g.append('g').attr('class', 'x axis').style('transform', `translate(0,${height}px)`);
  yAxis = d3.axisLeft().scale(yscale);
  groupYAxis = g.append('g').attr('class', 'y axis');
}

function update(data, orig13, orig17) {
  xscale.domain(data.nrw17.map(d => d.key));
  yscale.domain([0, Math.max(
    d3.max(data.nrw13, d => d.value),
    d3.max(data.nrw17, d => d.value),
  )]);

  groupXAxis.call(xAxis);
  groupYAxis.call(yAxis);

  const rect13 = g.selectAll('.nrw13').data(data.nrw13, d => d.key);
  const rect13Enter = rect13.enter().append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .classed('nrw13', true)
    .attr('width', xscale.bandwidth())
    .attr('height', 0)
    .on('click', (d) => {
      bubbleChartUpdate(orig13, currentGKZ(), d.key);
    });
  rect13Enter.append('title');
  rect13.merge(rect13Enter).transition()
    .attr('height', d => height - yscale(d.value))
    .attr('y', d => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', d => xscale(d.key) + (xscale.bandwidth() / 3))
    .style('fill', d => `hsl(${colors[d.key]},100%,40%)`);
  rect13.merge(rect13Enter).select('title').text(d => `${d.key}-Stimmen 2013`);
  rect13.exit().remove();

  const rect17 = g.selectAll('.nrw17').data(data.nrw17, d => d.key);
  const rect17Enter = rect17.enter().append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .classed('nrw17', true)
    .attr('width', xscale.bandwidth())
    .attr('height', 0)
    .on('click', (d) => {
      bubbleChartUpdate(orig17, currentGKZ(), d.key);
    });
  rect17Enter.append('title');
  rect17.merge(rect17Enter).transition()
    .attr('height', d => height - yscale(d.value))
    .attr('y', d => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', d => xscale(d.key))
    .style('fill', d => `hsl(${colors[d.key]},100%,50%)`);
  rect17.merge(rect17Enter).select('title').text(d => `${d.key}-Stimmen 2017`);
  rect17.exit().remove();
}

function barchartUpdate(data13, data17, gkz) {
  const common = Object.keys(data13[0]).filter(x => Object.keys(data17[0]).includes(x));
  const data13GKZ = data13.filter(x => x.GKZ === gkz)[0];
  const data17GKZ = data17.filter(x => x.GKZ === gkz)[0];
  const nrw13 = [];
  const nrw17 = [];

  for (let i = 6; i < common.length; i += 1) {
    nrw13.push({
      key: common[i],
      value: data13GKZ[common[i]],
    });
  }

  for (let i = 6; i < common.length; i += 1) {
    nrw17.push({
      key: common[i],
      value: data17GKZ[common[i]],
    });
  }
  update({ nrw13, nrw17 }, data13, data17);
}

export { barchartCreate, barchartUpdate };
