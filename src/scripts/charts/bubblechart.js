import * as d3 from 'd3';

let g;
let svg;
const margin = {
  top: 10,
  bottom: 20,
  left: 80,
  right: 60,
};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

function bubbleChartCreate() {
  svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");
}

function update(data) {
  var diameter = 600;
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  // transition
  var t = d3.transition()
  .duration(750);
  var bubble = d3.pack(data)
    .size([diameter, diameter])
    .padding(1.5);

  var nodes = d3.hierarchy(data)
    .sum(function(d) { return d.Count; });


  //JOIN
  var circle = svg.selectAll("circle")
  .data(bubble(nodes).leaves(), function(d){ return d.data.name; });

//EXIT
circle.exit()
  .style("fill", function(d,i) { return color(d.data.Cluster); })
.transition(t)
  .attr("r", 1e-6)
  .remove();

//UPDATE
circle
.transition(t)
  .style("fill", function(d,i) { return color(d.data.Cluster); })
  .attr("r", function(d){ return d.r })
  .attr("cx", function(d){ return d.x; })
  .attr("cy", function(d){ return d.y; })

//ENTER
circle.enter().append("circle")
  .attr("r", 1e-6)
  .attr("cx", function(d){ return d.x; })
  .attr("cy", function(d){ return d.y; })
  .style("fill", function(d,i) { return color(d.data.Cluster); })
.transition(t)
  .style("fill", function(d,i) { return color(d.data.Cluster); })
  .attr("r", function(d){ return d.r });

    /*
  svg.selectAll('circle').remove();

  var node = svg.selectAll(".node")
    .data(bubble(nodes).descendants())
    .enter()
    .filter(function(d){ return  !d.children });

  node.append("circle")
    .attr("r", function(d) {return d.r;})
    .style("fill", function(d,i) { return color(d.data.Cluster); })
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }); */
}

function bubbleChartUpdate(data17, gkz, ebene) { 
    var firstClusterData = [];
    var secondClusterData = [];
    console.log(gkz);
    for (let i = 0; i < data17.length; i += 1) {
        if(data17[i].GKZ.substring(1, ebene*2) === gkz.substring(1, ebene*2)) {
            firstClusterData.push({
                "Name": data17[i].GKZ,
                "Count": data17[i].Abgegebene,
                "Cluster": 1
              });  
        } else {
            secondClusterData.push({
                "Name": data17[i].GKZ,
                "Count": data17[i].Abgegebene,
                "Cluster": 2
              });
        }

      }
      
    update({"children": [{"Name":"First", "children": firstClusterData }, {"Name":"Second", "children": secondClusterData } ]});
}
export { bubbleChartCreate, bubbleChartUpdate };
