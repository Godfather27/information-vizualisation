import * as d3 from 'd3';
import { color } from 'd3-color';

let svg;
let div;
const margin = {
  top: 10,
  bottom: 20,
  left: 80,
  right: 60,
};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function bubbleChartCreate() {
  svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'bubble');

  // Define the div for the tooltip
  div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
}

function update(data) {
  const diameter = 600;
  const color = d3.scaleOrdinal(d3.schemeCategory20);
  // transition
  const t = d3.transition().duration(2000);

  const bubble = d3.pack(data)
    .size([diameter, diameter])
    .padding(1.5);

  const nodes = d3.hierarchy(data)
    .sum((d => d.count));

  // JOIN
  const circle = svg.selectAll('circle')
    .data(bubble(nodes).leaves(), (d => d.data.gkz));

  circle
    .on('mouseover', function(d) { 
      div.transition()
        .duration(200)
        .style('opacity', .9);
      div.html(d.data.name)
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY - 14) + 'px');
      })
    .on('mouseout', function(d) {
      div.transition()
        .duration(200)
        .style("opacity", .0);})

  // EXIT
  circle.exit()
    .style('fill', (d => color(d.data.type)))
    .transition(t)
    .attr('r', 1e-6)
    .remove();

  // UPDATE
  circle
    .transition(t)
    .style('fill', (d => color(d.data.type)))
    .attr('r', (d => d.r))
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y));

  // ENTER
  circle.enter().append('circle')
    .attr('r', 1e-6)
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y))
    .style('fill', (d => color(d.data.type)))
    .transition(t)
    .style('fill', (d => color(d.data.type)))
    .attr('r', (d => d.r));
}

function bubbleChartUpdate(data17, gkz, ebene) {
  const firstClusterData = [];
  const secondClusterData = [];

  for (let i = 0; i < data17.length; i += 1) {
    const parteien = {
      SPÖ: data17[i].SPÖ,
      ÖVP: data17[i].ÖVP,
      FPÖ: data17[i].FPÖ,
      GRÜNE: data17[i].GRÜNE,
      NEOS: data17[i].NEOS,
      KPÖ: data17[i].KPÖ,
      CPÖ: data17[i].CPÖ,
      M: data17[i].M,
      EUAUS: data17[i].EUAUS,
      SLP: data17[i].SLP,
    };

    const mostVotes =
    Object.keys(parteien).reduce(function(a, b){ return parteien[a] > parteien[b] ? a : b });

    if (data17[i].GKZ.substring(2, 4) !== '00') { // bundesländer und wahlkarten weg
      if (data17[i].GKZ.substring(1, ebene * 2) === gkz.substring(1, ebene * 2)) {
        firstClusterData.push({
          gkz: data17[i].GKZ,
          name: data17[i].Gebietsname,
          count: data17[i].Abgegebene,
          type: 2,
          winner: mostVotes,
          color: '',
        });
      } else {
        secondClusterData.push({
          gkz: data17[i].GKZ,
          name: data17[i].Gebietsname,
          count: data17[i].Abgegebene,
          type: 1,
          winner: mostVotes,
          color: '',
        });
      }
    }
  }

  update({ children: [{ Name: 'First', children: firstClusterData }, { Name: 'Second', children: secondClusterData }]});
}
export { bubbleChartCreate, bubbleChartUpdate };
