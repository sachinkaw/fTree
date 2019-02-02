function Tree(initialState) {
  this.tree = initialState || {};
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

// You could also argue Node should be a 'type', but it's probably overkill here.
function createNode(node) {
  var nodeBasics = {
    id: generateUUID(),
    children: []
  };

  return Object.assign({}, nodeBasics, node);
}

Tree.prototype.addParent = function(node, child) {
  if (!child) {
    throw new Error("Can't add a parent node without a child.");
  }

  var newNode = createNode(node);
  newNode.children.push(child);
  this.tree = newNode;
};

Tree.prototype.addChild = function(node, parent) {
  var newNode = createNode(node);
  if (parent) {
    parent.children.push(newNode);
    return;
  }

  if (!this.isEmpty && !parent) {
    throw new Error(
      "Can't add a node without a parent or child unless it's the first one."
    );
  }

  this.tree = newNode;
};

Tree.prototype.addSibling = function(node, sibling) {
  if (!sibling) {
    throw new Error("Tried to add a sibling, but sibling didn't exist.");
  }
  var parent = this.findParent(sibling);
  if (!parent) {
    throw new Error("Couldn't find a parent for that sibling.");
  }
  parent.children.push(node);
};

Tree.prototype.isEmpty = function() {
  return (
    Object.keys(this.tree).length === 0 && this.tree.constructor === Object
  );
};

Tree.prototype.findParent = function(needle, nodes) {
  var result = null;
  var haystack = nodes || this.tree;
  haystack.children.forEach(function(node) {
    if (node.id === needle.id) {
      result = haystack;
    } else {
      result = this.findParent(needle, haystack);
    }
  });
  return result;
};
