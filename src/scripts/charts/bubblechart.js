import * as d3 from 'd3';

/**
 * global variables
 */
let svg;
let div;
const margin = {
  top: 10,
  bottom: 20,
  left: 80,
  right: 60,
};
const width = (window.innerWidth * 0.45) - margin.left - margin.right;
const height = (window.innerHeight / 2) - margin.top - margin.bottom;

/**
 * color definitions
 */
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

/**
 * create function for bubble chart
 * creates and appends svg element to DOM
 * creates and appends tooltip element to DOM
 */
function bubbleChartCreate() {
  svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'bubble');

  // Define the div for the tooltip
  div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
}

/**
 * data update function for bubble chart
 */
function update(data) {
  // transition definition
  const t = d3.transition().duration(2000);

  // create data back for bubbles
  const bubble = d3.pack(data)
    .size([width, height])
    .padding(1.5);

  const nodes = d3.hierarchy(data)
    .sum((d => d.count));


  const circle = svg.selectAll('circle')
    .data(bubble(nodes).leaves(), (d => d.data.gkz));

  // definition for mouse events to show tooltip
  circle
    .on('mouseover', (d) => {
      div.transition()
        .duration(200)
        .style('opacity', 0.9);
      div.html(`${d.data.name}<br>${d.data.label}: ${d.data.count} Stimmen`)
        .style('left', `${d3.event.pageX}px`)
        .style('top', `${d3.event.pageY - 14}px`);
    })
    .on('mouseout', () => {
      div.transition()
        .duration(200)
        .style('opacity', 0.0);
    });

  // exit phase
  circle.exit()
    .style('fill', (d => d.data.color))
    .transition(t)
    .attr('r', 1)
    .remove();

  // update phase
  circle
    .transition(t)
    .style('fill', (d => d.data.color))
    .attr('r', (d => d.r))
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y));

  // enter phase
  circle.enter().append('circle')
    .attr('r', 1)
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y))
    .style('fill', (d => d.data.color))
    .transition(t)
    .attr('r', (d => d.r));
}

/**
 * filters dataset and builds data structure bubble cluster
 */
function bubbleChartUpdate(data, gkz, partei = null) {
  const firstClusterData = [];
  const secondClusterData = [];
  let ebene = 1;

  // defines the region level
  if (gkz.substring(2, 4) === '00') {
    ebene = 1;
  } else if (gkz.substring(4, 6) === '00') {
    ebene = 2;
  } else {
    ebene = 3;
  }

  for (let i = 0; i < data.length; i += 1) {
    if (data[i].GKZ.substring(2, 4) !== '00' && data[i].GKZ.substring(4, 6) !== '00') {
      let countValue = data[i].Abgegebene;
      let countLabel = 'Gesamt';
      let bubbleColor = `hsl(${0},0%,0%)`;

      // changes color for bubbles if 'partei' is set
      if (partei) {
        countValue = data[i][partei];
        countLabel = partei;
        bubbleColor = `hsl(${colors[countLabel]},100%,50%)`;
      }

      // structures the tow clusters for the bubble chart
      if (data[i].GKZ.substring(1, ebene * 2) === gkz.substring(1, ebene * 2) || gkz === 'G00000') {
        firstClusterData.push({
          gkz: data[i].GKZ,
          name: data[i].Gebietsname,
          count: countValue,
          label: countLabel,
          color: bubbleColor,
        });
      } else {
        secondClusterData.push({
          gkz: data[i].GKZ,
          name: data[i].Gebietsname,
          count: countValue,
          label: countLabel,
          color: bubbleColor,
        });
      }
    }
  }

  update({ children: [{ Name: 'First', children: firstClusterData }, { Name: 'Second', children: secondClusterData }] });
}
export { bubbleChartCreate, bubbleChartUpdate };
