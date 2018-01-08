import * as d3 from 'd3';

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
  d3.select('body')
    .append('h2')
    .html('Dunkler Cluster zeigt Gemeindes des ausgewählten Gebiet');

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
  // transition
  const t = d3.transition().duration(2000);

  const bubble = d3.pack(data)
    .size([600, 600])
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
      div.html(d.data.name + '<br>' + d.data.label + ': ' + d.data.count + ' Stimmen')
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY - 14) + 'px');
      })
    .on('mouseout', function(d) {
      div.transition()
        .duration(200)
        .style("opacity", .0);})

  // EXIT
  circle.exit()
    .style('fill', (d => d.data.color))
    .transition(t)
    .attr('r', 1)
    .remove();

  // UPDATE
  circle
    .transition(t)
    .style('fill', (d => d.data.color))
    .attr('r', (d => d.r))
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y));

  // ENTER
  circle.enter().append('circle')
    .attr('r', 1)
    .attr('cx', (d => d.x))
    .attr('cy', (d => d.y))
    .style('fill', (d => d.data.color))
    .transition(t)
    // .style('fill', (d => d.data.color))
    .attr('r', (d => d.r));
}

function bubbleChartUpdate(data17, gkz, partei = null) {
  const firstClusterData = [];
  const secondClusterData = [];
  let ebene = 1;

  if (gkz.substring(2, 4) === '00') {
    ebene = 1;
  } else if (gkz.substring(4, 6) === '00') {
    ebene = 2;
  } else {
    ebene = 3;
  }

  for (let i = 0; i < data17.length; i += 1) {
    if (data17[i].GKZ.substring(2, 4) !== '00' && data17[i].GKZ.substring(4, 6) !== '00') { // bundesländer und wahlkarten weg
      let countValue = data17[i].Abgegebene;
      let countLabel = 'Gesamt';
      if (partei) {
        countValue = data17[i][partei];
        countLabel = partei;
      }
      if (data17[i].GKZ.substring(1, ebene * 2) === gkz.substring(1, ebene * 2) || gkz === 'G00000') {
        firstClusterData.push({
          gkz: data17[i].GKZ,
          name: data17[i].Gebietsname,
          count: countValue,
          label: countLabel,
          color: '#104E8B',
        });
      } else {
        secondClusterData.push({
          gkz: data17[i].GKZ,
          name: data17[i].Gebietsname,
          count: countValue,
          label: countLabel,
          color: '#B0E2FF',
        });
      }
    }
  }

  update({ children: [{ Name: 'First', children: firstClusterData }, { Name: 'Second', children: secondClusterData }]});
}
export { bubbleChartCreate, bubbleChartUpdate };
