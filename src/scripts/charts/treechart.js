/* eslint no-use-before-define: 0 */
import * as d3 from 'd3';
import { barchartUpdate } from './barchart';
import { buildGraph, collapse, openChildren } from './../helper/graph';
import { bubbleChartUpdate } from './bubblechart';

const width = 800;
const height = 500;
const duration = 50;
let data13;
let data17;
let tree;
let root;
let svg;

const setManualSpacing = (d) => {
  d.y = (d.depth * width) / 4;
  if (d.depth > 0) {
    d.x = (((height - 20) / (Math.max(d.parent.children.length - 1, 1))) *
      d.parent.children.findIndex(e => e.data.GKZ === d.data.GKZ)) + 10;
  } else {
    d.x = height / 2;
  }
};

function openNode(d) {
  d3.select('body h1').html('Ausgewähltes Gebiet: ' + d.data.Gebietsname);
  collapse(root);
  openChildren(d);
  treechartUpdate();
  barchartUpdate(data13, data17, d.data.GKZ);
  bubbleChartUpdate(data17, d.data.GKZ);
}

function treechartUpdate() {
  const treeData = tree(root);
  const nodes = treeData.descendants();

  updateNodes(nodes);
  updateLinks(treeData, nodes);
}

function updateNodes(nodes) {
  nodes.forEach(setManualSpacing);

  const node = svg.selectAll('g.node')
    .data(nodes, d => d.data.GKZ);

  const nodeEnter = node.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('click', openNode);

  nodeEnter.append('path')
    .attr('class', 'rect')
    .attr('d', d => d3.path().rect(d.x, d.y, 50, 25));

  nodeEnter
    .attr('fill-opacity', 0)
    .transition(duration)
    .attr('fill-opacity', 1);

  nodeEnter.append('text')
    .attr('dy', '.35em')
    .attr('text-anchor', 'start')
    .text(d => d.data.Gebietsname);

  const nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .attr('transform', d => `translate(${d.y},${d.x})`);

  const nodeExit = node.exit()
    .transition(duration)
    .style('fill-opacity', 0)
    .remove();

  nodeExit.select('text')
    .style('fill-opacity', 0);
}

function updateLinks(treeData, nodes) {
  const links = treeData.links(nodes);
  const link = svg.selectAll('.link')
    .data(links, d => d.target.GKZ);

  const linkEnter = link.enter().append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal()
      .x(d => d.y + 25)
      .y(d => d.x));

  linkEnter
    .style('stroke-opacity', 0)
    .transition(duration)
    .style('stroke-opacity', 0.2);

  const linkUpdate = link.merge(link)
    .style('stroke-opacity', 0)
    .transition(duration)
    .style('stroke-opacity', 0.2);

  const linkExit = link.exit()
    .transition(duration)
    .style('stroke-opacity', 0)
    .remove();
}

function treechartCreate(source13, source17) {
  data17 = source17;
  data13 = source13;
  const data = buildGraph(source17);

  svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  tree = d3.tree().size([height, width]);
  root = d3.hierarchy(data);

  root.children.forEach(collapse);

  treechartUpdate();
}

export { treechartCreate, treechartUpdate };
