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
  var nodeEssentials = {
    extra: {
      id: generateUUID()
    },
    marriages: [],
    children: []
  };

  return Object.assign({}, nodeEssentials, node);
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
  if (!parent) {
    throw new Error("Tried to add a child, but couldn't find parent.");
  }

  var newNode = createNode(node);
  if (parent) {
    if (parent.marriages.length) {
      // Adding child to parent assumes first element in marriages. To add to a different marriage,
      // I guess you'd use addSibling. Kind of annoying that they must be called 'marriages'!
      parent.marriages[0].children.push(newNode);
    } else {
      // Spouse unknown at this point, so no 'marriage'
      if (parent.children) {
        parent.children.push(newNode);
      } else {
        parent.children = [newNode];
      }
    }
    return;
  }

  if (this.isEmpty && !parent) {
    throw new Error(
      "Can't add a node without a parent or child unless it's the first one."
    );
  }

  this.tree = newNode;
};

Tree.prototype.addSibling = function(node, parent) {
  if (!parent) {
    throw new Error("Tried to add a sibling, but couldn't find parent.");
  }

  var newNode = createNode(node);
  if (parent.marriages.length) {
    // TODO: consider selecting for a particular 'marriage'
    parent.marriages[0].children.push(newNode);
  } else {
    parent.children.push(newNode);
  }
};

Tree.prototype.isEmpty = function() {
  return (
    Object.keys(this.tree).length === 0 && this.tree.constructor === Object
  );
};

Tree.prototype.findNodeByIdInChildren = function(needle, haystack) {
  var self = this;
  var result = null;
  var found = haystack.children.find(function(child) {
    return child.extra.id === needle;
  });
  if (found) {
    return found;
  }

  haystack.children.forEach(function(child) {
    var found = self.findNodeById(needle, child);
    if (found) {
      result = found;
    }
  });

  return result;
};

Tree.prototype.findNodeByIdInMarriages = function(needle, haystack) {
  var self = this;
  var result = null;
  haystack.marriages.find(function(marriage) {
    return !!marriage.children.find(function(child) {
      if (child.extra.id === needle) {
        result = child;
        return true;
      }
      return false;
    });
  });

  if (result) {
    return result;
  }

  haystack.marriages.forEach(function(marriage) {
    marriage.children.forEach(function(node) {
      var found = self.findNodeById(needle, node);
      if (found) {
        result = found;
      }
    });
  });

  return result;
};

Tree.prototype.findNodeById = function(needle, nodes) {
  var result = null;
  var haystack = nodes || this.tree;

  if (haystack.extra.id === needle) {
    return haystack;
  }

  if (haystack.children.length) {
    result = this.findNodeByIdInChildren(needle, haystack);
    if (result) {
      return result;
    }
  }

  if (haystack.marriages.length) {
    result = this.findNodeByIdInMarriages(needle, haystack);
  }

  return result;
};

// NOTE: non-recursive, just looks in the next tier for a match.
Tree.prototype.hasChild = function(needle, haystack) {
  var found = haystack.children.find(function(child) {
    return child.extra.id === needle;
  });

  if (found) {
    return true;
  }

  return !!haystack.marriages.find(function(marriage) {
    return !!marriage.children.find(function(child) {
      return child.extra.id === needle;
    });
  });
};

Tree.prototype.findParentById = function(needle, nodes) {
  var haystack = nodes || this.tree;
  var result = null;
  var self = this;

  if (this.hasChild(needle, haystack)) {
    return haystack;
  }

  if (haystack.children.length) {
    haystack.children.forEach(function(child) {
      var found = self.findParentById(needle, child);
      if (found) {
        result = found;
      }
    });
  }

  if (haystack.marriages.length) {
    haystack.marriages.forEach(function(marriage) {
      marriage.children.forEach(function(child) {
        var found = self.findParentById(needle, child);
        if (found) {
          result = found;
        }
      });
    });
  }

  return result;
};
