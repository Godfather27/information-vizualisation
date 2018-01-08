/* eslint no-use-before-define: 0 */
import * as d3 from 'd3';
import { barchartUpdate } from './barchart';

const width = 800;
const height = 500;
const duration = 50;
let data13;
let data17;
let treemap;
let root;
let svg;

function buildGraph(source) {
  let data;
  source.forEach((result) => {
    if (result.GKZ === 'G00000') {
      data = result;
      data.children = [];
    } else if (+result.GKZ.slice(2, 6) === 0 && /G\d{5}/.test(result.GKZ)) {
      if (!data) {
        data = {
          GKZ: 'G00000',
          children: [],
          Gebietsname: 'Österreich',
        };
      }
      result.children = [];
      data.children.push(result);
    } else if (+result.GKZ.slice(5, 6) === 0) {
      result.children = [];
      data.children[+result.GKZ.slice(1, 2) - 1].children.push(result);
    } else if (!/Wahlkarten/.test(result.Gebietsname)) {
      const parent = data.children[+result.GKZ.slice(1, 2) - 1].children
        .find(e => e.GKZ.slice(0, 4) === result.GKZ.slice(0, 4));
      parent.children.push(result);
    }
  });
  return data;
}

function collapse(d) {
  if (d.children) {
    d.collapsedChildren = d.children;
    d.collapsedChildren.forEach(collapse);
    d.children = null;
  }
}

function openChildren(d) {
  d.children = d.collapsedChildren;
  d.collapsedChildren = null;
  if (d.parent) {
    openChildren(d.parent);
  }
}

function openNode(d) {
  collapse(root);
  openChildren(d);
  treechartUpdate();
  barchartUpdate(data13, data17, d.data.GKZ);
}

const setManualSpacing = (d, i) => {
  d.y = (d.depth * width) / 4;
  if (d.depth === 1) {
    const statePosition = (height / 2 / d.parent.children.length) * (i - 1);
    const marginTop = height / 4;
    d.x = statePosition + marginTop;
  } else if (d.depth === 0) {
    d.x = height / 2;
  }
};

function treechartUpdate() {
  const treeData = treemap(root);

  const nodes = treeData.descendants();

  nodes.forEach(setManualSpacing);

  const node = svg.selectAll('g.node')
    .data(nodes, d => d.data.GKZ);

  const nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('click', openNode);

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

  const nodeExit = node.exit().transition(duration)
    .style('fill-opacity', 1e-6)
    .remove();

    // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);
}

function treechartCreate(source13, source17) {
  data17 = source17;
  data13 = source13;
  const data = buildGraph(source17);

  svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  treemap = d3.tree().size([height, width]);
  root = d3.hierarchy(data);

  root.children.forEach(collapse);

  treechartUpdate();
}

export { treechartCreate, treechartUpdate };
