import * as d3 from 'd3';

// ************** Generate the tree diagram	 *****************
let width = window.innerWidth;
let height = window.innerHeight;
let treemap;
let root;
let svg;
let duration = 750;

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function wrangleData(source){
  let data
  source.forEach((result) => {
    if(result.GKZ === "G00000") {
      data = result;
      data.children = [];
    } else if (+result.GKZ.slice(2,6) === 0 && /G\d{5}/.test(result.GKZ)) {
      result.children = []
      data.children.push(result)
    } else if (+result.GKZ.slice(5,6) === 0) {
      result.children = []
      data.children[+result.GKZ.slice(1,2)-1].children.push(result)
    } else if (!/Wahlkarten/.test(result.Gebietsname)) {
      const parent = data.children[+result.GKZ.slice(1,2)-1].children
        .find(e => e.GKZ.slice(0,4) === result.GKZ.slice(0,4))
      parent.children.push(result)
    }
  })
  return data;
}

export function treechartCreate(source) {
  let data = wrangleData(source);
  
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")

  // declares a tree layout and assigns the size
  treemap = d3.tree().size([height, width]);
  // Assigns parent, children, height, depth
  root = d3.hierarchy(data);
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level
  root.children.forEach(collapse);

  treechartUpdate(root);
}

export function treechartUpdate(source) {
    // Assigns the x and y position for the nodes
    let treeData = treemap(root);
  
    // Compute the new tree layout.
    let nodes = treeData.descendants();
  
    // Normalize for fixed-depth.
    nodes.forEach(d => { d.y = d.depth * 180 });
  
    // ****************** Nodes section ***************************
  
    // Update the nodes...
    let node = svg.selectAll('g.node')
        .data(nodes, (d) => d.GKZ);
  
    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", (d)=> "translate(" + source.y0 + "," + source.x0 + ")")
      .on('click', toggleChildren);
  
    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("text-anchor", 'start')
        .text((d) => d.data.Gebietsname);
  
    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);
  
    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");
  
    // Remove any exiting nodes
    let nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", (d)=> "translate(" + source.y + "," + source.x + ")")
      .remove();
  
    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // Store the old positions for transition.
    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
}
function closeChildren(d) {
  d._children = d.children;
  d.children = null;
}

function openChildren(d) {
  d.children = d._children;
  d._children = null;
}

// Toggle children on click.
function toggleChildren(d) {
  if (d.children) {
    closeChildren(d)
  } else {
    openChildren(d)
  }
  treechartUpdate(d);
}
