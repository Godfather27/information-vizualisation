import * as d3 from 'd3';
import { bubbleChartUpdate } from './bubblechart';
import { currentGKZ } from './treechart';

// module globals
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

// Create Main Structures to be used
function barchartCreate() {
  // Creates sources <svg> element
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  // SVG group to draw in
  g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // x scale with bands for political parties and y scale for voted values
  xscale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.5);
  yscale = d3.scaleLinear().range([height, 0]);

  xAxis = d3.axisBottom().scale(xscale);
  groupXAxis = g.append('g').attr('class', 'x axis').style('transform', `translate(0,${height}px)`);
  yAxis = d3.axisLeft().scale(yscale);
  groupYAxis = g.append('g').attr('class', 'y axis');
}

// barchart Update function
function update(data, orig13, orig17) {
  // x scale domain = names of political parties
  xscale.domain(data.nrw17.map(d => d.key));
  // y scale domain = max value of all votes 2013 and 2017
  yscale.domain([0, Math.max(
    d3.max(data.nrw13, d => d.value),
    d3.max(data.nrw17, d => d.value),
  )]);

  // call the axes
  groupXAxis.call(xAxis);
  groupYAxis.call(yAxis);

  // select 2013 rects in group and bind data
  // by political party names (so key doesnt change --> transition)
  const rect13 = g.selectAll('.nrw13').data(data.nrw13, d => d.key);
  // enter phase set initial values and bind click handler to update the bubblechart
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
  // update phase create or remove rects depending on data
  // set final values for the bars and the hover title
  rect13.merge(rect13Enter).transition()
    .attr('height', d => height - yscale(d.value))
    .attr('y', d => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', d => xscale(d.key) + (xscale.bandwidth() / 3))
    .style('fill', d => `hsl(${colors[d.key]},100%,40%)`);
  rect13.merge(rect13Enter).select('title').text(d => `${d.key}-Stimmen 2013`);
  // exit phase
  rect13.exit().remove();

  // select 2017 rects in group and bind data
  // by political party names (so key doesnt change --> transition)
  const rect17 = g.selectAll('.nrw17').data(data.nrw17, d => d.key);
  // enter phase set initial values and bind click handler to update the bubblechart
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
  // update phase create or remove rects depending on data
  // set final values for the bars and the hover title
  rect17.merge(rect17Enter).transition()
    .attr('height', d => height - yscale(d.value))
    .attr('y', d => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', d => xscale(d.key))
    .style('fill', d => `hsl(${colors[d.key]},100%,50%)`);
  rect17.merge(rect17Enter).select('title').text(d => `${d.key}-Stimmen 2017`);
  // exit phase
  rect17.exit().remove();
}

// function to be called from outside
// wrangles data and handles the update call
function barchartUpdate(data13, data17, gkz) {
  // retrieves an intercept of the keys of 2013 and 2017
  // not comparable values are omited
  const common = Object.keys(data13[0]).filter(x => Object.keys(data17[0]).includes(x));
  // retrieve only the objects having the input gkz
  const data13GKZ = data13.filter(x => x.GKZ === gkz)[0];
  const data17GKZ = data17.filter(x => x.GKZ === gkz)[0];
  const nrw13 = [];
  const nrw17 = [];

  // loop the common party names (parties are starting at key 6)
  // push party name as key and party votes as value to array
  for (let i = 6; i < common.length; i += 1) {
    nrw13.push({
      key: common[i],
      value: data13GKZ[common[i]],
    });
  }

  // loop the common party names (parties are starting at key 6)
  // push party name as key and party votes as value to array
  for (let i = 6; i < common.length; i += 1) {
    nrw17.push({
      key: common[i],
      value: data17GKZ[common[i]],
    });
  }
  // call update with wrangled data and a reference to original data for bubblechart call
  update({ nrw13, nrw17 }, data13, data17);
}

export { barchartCreate, barchartUpdate };
