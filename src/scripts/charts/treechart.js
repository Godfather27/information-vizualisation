import * as d3 from 'd3';

const width = window.innerWidth;
const height = window.innerHeight;
let data = null;

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);
const g = svg.append('g').attr('transform', 'translate(40,0)');

const tree = d3.tree()
  .size([height, width - 160]);

function updateTreechart(newData) {
  data = newData;
  const root = d3.hierarchy(data);
  // update phase
  const link = g.selectAll('.link')
    .data(tree(root).links(), d => d.source.data.gkz);
  const node = g.selectAll('.node')
    .data(root.descendants(), d => d.data.gkz);

  // enter phase
  const linkEnter = link.enter().append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));
  const nodeEnter = node.enter().append('g')
    .attr('class', d => `node node--${d.children ? 'internal' : 'leaf'}`)
    .attr('transform', d => `translate(${d.y}, ${d.x})`)
    .on('click', toggleNode);

  nodeEnter.append('circle')
    .attr('r', 20);

  nodeEnter.append('text')
    .attr('dy', 3)
    .attr('y', -10)
    .style('text-anchor', 'start')
    .text(d => d.data.name);

  // exit phase
  const linkExit = link.exit().remove();
  const nodeExit = node.exit().remove();
}

function toggleNode(node) {
  const toggledNode = node;
  if (node.children) {
    delete toggledNode.children;
  } else {
    toggledNode.children = node._children;
  }
}

export default updateTreechart;
