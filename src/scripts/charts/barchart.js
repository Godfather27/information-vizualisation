import * as d3 from 'd3';

let xscale, yscale, groupYAxis, groupXAxis, yAxis, xAxis, g;
const margin = {top: 10, bottom: 20, left: 80, right: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const colors = {
  "SPÖ" : 0,
  "ÖVP" : 172,
  "FPÖ" : 235,
  "GRÜNE" : 120,
  "NEOS" : 306,
  "KPÖ" : 55,
  "CPÖ" : 36,
  "M" : 272,
  "EUAUS" : 69,
  "SLP" : 142
}

function barchartCreate() {
  // Creates sources <svg> element
  const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  xscale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.5);
  yscale = d3.scaleLinear().range([height,0]);

  xAxis = d3.axisBottom().scale(xscale);
  groupXAxis = g.append('g').attr('class','x axis').style("transform","translate(0,"+height+"px)");
  yAxis = d3.axisLeft().scale(yscale);
  groupYAxis = g.append('g').attr('class','y axis');
}

function barchartUpdate(data13, data17, gemeinde){

  let inputGKZ = gemeinde // todo variable
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

    xscale.domain(data.nrw17.map( d => d.key));
    yscale.domain([0, Math.max(d3.max(data.nrw13, (d) => d.value),d3.max(data.nrw17, (d) => d.value))]);

  //render the axis
  groupXAxis.call(xAxis);
  groupYAxis.call(yAxis);
  // Render the chart with new data
  // DATA JOIN use the key argument for ensurign that the same DOM element is bound to the same data-item



  const rect = g.selectAll('.nrw13').data(data.nrw13, (d) => d.key);
  const rect_enter = rect.enter().append('rect')
    .attr('x', 0) //set intelligent default values for animation
    .attr('y', 0)
    .classed("nrw13",true)
    .attr('width', xscale.bandwidth())
    .attr('height', 0);
  rect_enter.append('title');
  rect.merge(rect_enter).transition()
    .attr('height', (d) => height - yscale(d.value))
    .attr('y', (d) => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', (d) => xscale(d.key)+25)
    .style('fill', (d) => 'hsl('+colors[d.key]+',100%,40%)');
  rect.merge(rect_enter).select('title').text((d) => d.key);
  rect.exit().remove();

  const rect2 = g.selectAll('.nrw17').data(data.nrw17, (d) => d.key);
  const rect_enter2 = rect2.enter().append('rect')
    .attr('x', 0) //set intelligent default values for animation
    .attr('y', 0)
    .classed("nrw17",true)
    .attr('width', xscale.bandwidth())
    .attr('height', 0);
  rect_enter2.append('title');
  rect2.merge(rect_enter2).transition()
    .attr('height', (d) => height - yscale(d.value))
    .attr('y', (d) => yscale(d.value))
    .attr('width', xscale.bandwidth())
    .attr('x', (d) => xscale(d.key)+5)
    .style('fill', (d) => 'hsl('+colors[d.key]+',100%,50%)');
  rect2.merge(rect_enter2).select('title').text((d) => d.key);
  rect2.exit().remove();
}

export {barchartCreate, barchartUpdate};


