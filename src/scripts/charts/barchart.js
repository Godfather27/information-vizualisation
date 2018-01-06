import * as d3 from 'd3';

let xscale, yscale, groupYAxis, groupXAxis, yAxis, xAxis, g;

function barchartCreate() {
  const margin = {top: 40, bottom: 10, left: 120, right: 20};
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  // Creates sources <svg> element
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  // Group used to enforce margin
  g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  // Scales setup
  xscale = d3.scaleLinear().range([0, width]);
  yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.3);
  // Axis setup
  xAxis = d3.axisTop().scale(xscale);
  groupXAxis = g.append('g').attr('class','x axis');
  yAxis = d3.axisLeft().scale(yscale);
  groupYAxis = g.append('g').attr('class','y axis');
}

function barchartUpdate(data13, data17){

  let inputGKZ = 'G90000' // todo variable
  let common = Object.keys(data13[0]).filter(x => Object.keys(data17[0]).includes(x));
  data13 = data13.filter( x => x.GKZ == inputGKZ)[0]
  data17 = data17.filter( x => x.GKZ == inputGKZ)[0]
  let nrw13 = []
  let nrw17 = []

  for(var i = 6; i < common.length; i++){
    nrw13.push({
      key: common[i],
      value: data13[common[i]]
    })
  }

  for(var i = 6; i < common.length; i++){
    nrw17.push({
      key: common[i],
      value: data17[common[i]]
    })
  }
  update({nrw13, nrw17});
}

function update(data) {
  console.log(data)
    //update the scales
  xscale.domain([0, Math.max(d3.max(data.nrw13, (d) => d.value),d3.max(data.nrw17, (d) => d.value))]);
  yscale.domain(data.nrw17.map( d => d.key));

  //render the axis
  groupXAxis.call(xAxis);
  groupYAxis.call(yAxis);
  // Render the chart with new data
  // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item

  const rect2 = g.selectAll('.nrw17').data(data.nrw17, (d) => d.key);
  const rect_enter2 = rect2.enter().append('rect')
    .attr('x', 0) //set intelligent default values for animation
    .attr('y', 0)
    .classed("nrw17",true)
    .attr('width', 0)
    .attr('height', yscale.bandwidth());
  rect_enter2.append('title');
  rect2.merge(rect_enter2).transition()
    .attr('height', yscale.bandwidth())
    .attr('width', (d) => xscale(d.value))
    .attr('y', (d) => yscale(d.key)+15)
    .style('fill','hsl(150,100%,50%)');
  rect2.merge(rect_enter2).select('title').text((d) => d.key);
  rect2.exit().remove();

  const rect = g.selectAll('.nrw13').data(data.nrw13, (d) => d.key);
  const rect_enter = rect.enter().append('rect')
    .attr('x', 0) //set intelligent default values for animation
    .attr('y', 0)
    .classed("nrw13",true)
    .attr('width', 0)
    .attr('height', yscale.bandwidth());
  rect_enter.append('title');
  rect.merge(rect_enter).transition()
    .attr('height', yscale.bandwidth())
    .attr('width', (d) => xscale(d.value))
    .attr('y', (d) => yscale(d.key))
    .style('fill','hsl(160,100%,50%)');
  rect.merge(rect_enter).select('title').text((d) => d.key);
  rect.exit().remove();


}

export {barchartCreate, barchartUpdate};


