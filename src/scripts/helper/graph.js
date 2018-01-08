const copyObject = result => Object.assign({}, result);

function buildGraph(source) {
  let data;
  source.forEach((result) => {
    const isRoot = result.GKZ === 'G00000';
    const correctFormat = /G\d{5}/.test(result.GKZ);
    const isState = +result.GKZ.slice(2, 6) === 0;
    const isRegion = +result.GKZ.slice(4, 6) === 0;
    const isCommunity = !/Wahlkarten/.test(result.Gebietsname);

    if (!correctFormat) {
      return;
    } else if (isRoot) {
      data = copyObject(result);
      data.children = [];
    } else if (isState) {
      if (!data) {
        data = {
          GKZ: 'G00000',
          children: [],
          Gebietsname: 'Österreich',
        };
      }
      const leaf = copyObject(result);
      leaf.children = [];
      data.children.push(leaf);
    } else if (isRegion) {
      const leaf = copyObject(result);
      leaf.children = [];
      data.children[+result.GKZ.slice(1, 2) - 1].children.push(leaf);
    } else if (isCommunity) {
      const parent = data.children[+result.GKZ.slice(1, 2) - 1].children
        .find(e => e.GKZ.slice(0, 4) === result.GKZ.slice(0, 4));
      parent.children.push(copyObject(result));
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

export { buildGraph, collapse, openChildren };
