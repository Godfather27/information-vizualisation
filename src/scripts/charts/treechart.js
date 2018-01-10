/* eslint no-use-before-define: 0 */
import * as d3 from 'd3';
import { barchartUpdate } from './barchart';
import { buildGraph, collapse, openChildren } from './../helper/graph';
import { bubbleChartUpdate } from './bubblechart';

/**
 * getter function for currently selected gkz
 */
const currentGKZ = () => gkz;
const width = window.innerWidth * 0.55;
const height = window.innerHeight;
const duration = 50;
const padding = 80;
let gkz = 'G00000';
let data13;
let data17;
let tree;
let root;
let svg;

/**
 * sets fixed spacing for nodes in tree graph
 * standard spacing would move nodes inappropriatly
 */
const setManualSpacing = (d) => {
  d.y = (d.depth * width) / 4;
  if (d.depth > 0) {
    d.x = (((height - padding) / (Math.max(d.parent.children.length - 1, 1))) *
      d.parent.children.findIndex(e => e.data.GKZ === d.data.GKZ)) + (padding / 2);
  } else {
    d.x = height / 2;
  }
};

/**
 * eventhandler for click events on nodes
 * sets current GKZ
 * closes all nodes but the current one and its parents
 * updates all charts
 */
function openNode(d) {
  gkz = d.data.GKZ;
  collapse(root);
  openChildren(d);
  treechartUpdate();
  barchartUpdate(data13, data17, d.data.GKZ);
  bubbleChartUpdate(data17, d.data.GKZ);
}

/**
 * sets root hierarchy and descendants
 * and its descendants
 * and updates nodes and links
 */
function treechartUpdate() {
  const treeData = tree(root);
  const nodes = treeData.descendants();

  updateNodes(nodes);
  updateLinks(treeData, nodes);
}

/**
 * selects nodes
 * registers eventhandler
 * appends text and circles
 * sets transitions
 */
function updateNodes(nodes) {
  nodes.forEach(setManualSpacing);

  const node = svg.selectAll('g.node')
    .data(nodes, d => d.data.GKZ);

  // Enter Phase
  const nodeEnter = node.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('click', openNode);

  nodeEnter
    .attr('fill-opacity', 0)
    .transition(duration)
    .attr('fill-opacity', 1);

  nodeEnter.append('circle')
    .attr('r', 10)
    .style('fill', d => d.data.GKZ === gkz ? '#f00' : '#ccc');

  nodeEnter.append('text')
    .style('font-size', '0.75em')
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.Gebietsname);

  // Update Phase
  const nodeUpdate = nodeEnter.merge(node);

  nodeUpdate
    .attr('transform', d => `translate(${d.y},${d.x})`);

  nodeUpdate
    .select('circle')
    .attr('r', 10)
    .style('fill', d => d.data.GKZ === gkz ? '#99f' : '#eee');

  // Exit Phase
  const nodeExit = node.exit()
    .transition(duration)
    .style('fill-opacity', 0)
    .remove();

  nodeExit.select('text')
    .style('fill-opacity', 0)
    .remove();
}

/**
 * selects links (path between nodes)
 * appends links
 * sets transitions
 */
function updateLinks(treeData, nodes) {
  const links = treeData.links(nodes);
  const link = svg.selectAll('.link')
    .data(links, d => d.target.GKZ);

  // Enter Phase
  const linkEnter = link.enter().append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));

  linkEnter
    .style('stroke-opacity', 0)
    .transition(duration)
    .style('stroke-opacity', 0.2);

  // Update Phase
  const linkUpdate = link.merge(link)
    .style('stroke-opacity', 0)
    .transition(duration)
    .style('stroke-opacity', 0.2);

  // Exit Phase
  const linkExit = link.exit()
    .transition(duration)
    .style('stroke-opacity', 0)
    .remove();
}

/**
 * sets global variables
 * creates and appends svg element to DOM
 * creates tree and hierarchy
 */
function treechartCreate(source13, source17) {
  const data = buildGraph(source17);
  data17 = source17;
  data13 = source13;

  svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(50,0)');

  tree = d3.tree().size([height, width - 100]);
  root = d3.hierarchy(data);

  // initially close all leafs
  root.children.forEach(collapse);

  treechartUpdate();
}

export { treechartCreate, treechartUpdate, currentGKZ };
