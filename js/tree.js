// Manage family tree state for display using dTree.
//
// The overwhelming impression here is that almost all of this, particularly traversing the tree in
// searches, could be much better optimised. It's somewhat constrained by the format that dTree
// expects, though one option might be to store the whole thing in a different format and provide
// the ability to convert where required.
//
// The terminology used to describe families is rather archaic, but it's a side effect of dTree's
// conventions.
//
// Current limitations:
//  * dTree doesn't support tracing the lineage of the spouse, so adding a parent to a spouse
//  doesn't really work (the gender of the spouse is irrelevant here: whichever parent is created
//  first, the _other_ one is the spouse!)
//  * For similar reasons, currently can't add a sibling to a spouse. You _can_ add children though,
//  it records them under the 'marriage'.

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

Tree.prototype.renameNodeById = function(id, name) {
  var node = this.findNodeById(id);
  if (!node) {
    throw new Error("Couldn't find that node.");
  }

  node.name = name;
};

Tree.prototype.addParent = function(node, child) {
  if (!child) {
    throw new Error("Can't add a parent node without a child.");
  }

  if (this.findMarriageBySpouseId(child.extra.id)) {
    throw new Error(
      "Adding a parent to a spouse is currently unsupported, sorry!"
    );
  }

  var newNode = createNode(node);

  // If child already has a parent, for the moment at least we'd want to limit parents to two. So if
  // the child is in a 'marriage' with a 'spouse' and not in `parent.children`, this should fail.
  var existingParent = this.findParentById(child.extra.id);
  if (existingParent) {
    var inChildren = existingParent.children.find(function(c) {
      return child.extra.id === c.extra.id;
    });
    if (!inChildren) {
      throw new Error(
        "A child can't currently have more than two (biological) parents."
      );
    }

    // On the other hand, if the child is in `parent.children`, we should create a 'marriage' and
    // add the new parent as a 'spouse', moving the child out of `parent.children`.
    existingParent.marriages.push({
      spouse: newNode,
      children: [child]
    });
    existingParent.children = existingParent.children.filter(function(c) {
      return c.extra.id !== child.extra.id;
    });
    return;
  }

  // Finally, if the parent is not to become a spouse, and the child is currently the root node, we
  // should shift the entire tree so that the parent becomes the new root node.
  newNode.children.push(child);
  this.tree = newNode;
};

Tree.prototype.addChild = function(node, parent) {
  if (!parent) {
    throw new Error("Tried to add a child, but couldn't find parent.");
  }

  var newNode = createNode(node);
  var marriage = this.findMarriageBySpouseId(parent.extra.id);
  if (marriage) {
    marriage.children.push(newNode);
    return;
  }
  if (parent.marriages.length) {
    // Adding child to parent assumes first element in marriages. To add to a different marriage,
    // I guess you'd use addSibling. Kind of annoying that they must be called 'marriages'!
    parent.marriages[0].children.push(newNode);
  } else {
    // Spouse unknown at this point, so no 'marriage'
    parent.children.push(newNode);
  }
};

Tree.prototype.addSibling = function(node, parent, siblingId) {
  if (this.findMarriageBySpouseId(siblingId)) {
    throw new Error(
      "Adding a sibling to a spouse is currently unsupported, sorry!"
    );
  }

  if (!parent) {
    throw new Error("Tried to add a sibling, but couldn't find parent.");
  }

  var newNode = createNode(node);
  if (parent.marriages.length) {
    // Try to add to the same 'marriage' as the sibling
    var sameMarriage = parent.marriages.find(function(marriage) {
      return !!marriage.children.find(function(child) {
        return child.extra.id === siblingId;
      });
    });
    if (sameMarriage) {
      sameMarriage.children.push(newNode);
      return;
    }
  }

  parent.children.push(newNode);
};

Tree.prototype.moveNode = function(nodeId, targetId) {
  var node = this.findNodeById(nodeId);
  var marriage = this.findMarriageBySpouseId(nodeId);
  var target = this.findNodeById(targetId);
  var targetSpouse = this.findMarriageBySpouseId(targetId);

  if (!marriage && !this.findParentById(nodeId)) {
    if (node.marriages.length) {
      // It's the root node, but there's a spouse so they become the new root node by default.
      // We just pick the first one in the array.
      this.tree = node.marriages[0].spouse;
      this.tree.children = node.marriages[0].children;
      node.marriages.shift();
    } else {
      throw new Error(
        "Can't move the root node without deleting the tree, sorry! Try adding another parent first?"
      );
    }
  } else {
    // It's not the root node, we can safely delete
    this.deleteNodeById(nodeId);
  }

  if (targetSpouse) {
    // Dropped node on a 'spouse'
    targetSpouse.children.push(node);
    return;
  }

  if (target.marriages.length) {
    // Default behaviour is to add the node to .marriages[0]
    target.marriages[0].children.push(node);
    return;
  }

  target.children.push(node);
};

Tree.prototype.findPartnerBySpouseId = function(needle, nodes) {
  var result = null;
  var self = this;
  var haystack = nodes || this.tree;

  haystack.marriages.some(function(marriage) {
    if (marriage.spouse.extra.id === needle) {
      result = haystack;
      return true;
    }
    return marriage.children.some(function(child) {
      var found = self.findPartnerBySpouseId(needle, child);
      if (found) {
        result = found;
        return true;
      }
      return false;
    });
  });

  if (result) {
    return result;
  }

  haystack.children.some(function(child) {
    return child.marriages.some(function(marriage) {
      if (marriage.spouse.extra.id === needle) {
        result = haystack;
        return true;
      }
      return marriage.children.some(function(c) {
        var found = self.findPartnerBySpouseId(needle, c);
        if (found) {
          result = found;
          return true;
        }
        return false;
      });
    });
  });

  return result;
};

Tree.prototype.deleteNodeById = function(nodeId) {
  var partner = this.findPartnerBySpouseId(nodeId);
  if (partner) {
    // Spouse going away, move all children from this 'marriage' to .children
    var marriage = partner.marriages.find(m => m.spouse.extra.id === nodeId);
    partner.children = partner.children.concat(marriage.children);

    // This exposes another weakness in the dTree model, since it does not allow for children of two parents
    // who are not in a 'marriage' (think: biological parenthood). Removing the marriage simply
    // removes it entirely, including the 'spouse'. Any children should be shifted to .children first.
    partner.marriages = partner.marriages.filter(function(marriage) {
      return marriage.spouse.extra.id !== nodeId;
    });
    return;
  }

  // Not a spouse, remove from parent (all child nodes and spouse will be removed)
  var parent = this.findParentById(nodeId);
  if (parent) {
    parent.children = parent.children.filter(
      child => child.extra.id !== nodeId
    );
    parent.marriages.some(function(marriage) {
      let len = marriage.children.length;
      marriage.children = marriage.children.filter(
        child => child.extra.id !== nodeId
      );
      return marriage.children.length < len;
    });
    return;
  }

  // At this point, we must be deleting the root node.
  this.tree = createNode({ name: "Empty" });
};

Tree.prototype.isEmpty = function() {
  return (
    Object.keys(this.tree).length === 0 && this.tree.constructor === Object
  );
};

Tree.prototype.findMarriageBySpouseId = function(needle, nodes) {
  var result = null;
  var self = this;
  var haystack = nodes || this.tree;

  var marriage = haystack.marriages.find(function(marriage) {
    return marriage.spouse.extra.id === needle;
  });

  if (marriage) {
    return marriage;
  }

  haystack.marriages.some(function(marriage) {
    return marriage.children.some(function(child) {
      var found = self.findMarriageBySpouseId(needle, child);
      if (found) {
        result = found;
        return true;
      }
      return false;
    });
  });

  if (result) {
    return result;
  }

  haystack.children.some(function(child) {
    var found = self.findMarriageBySpouseId(needle, child);
    if (found) {
      result = found;
      return true;
    }
    return false;
  });

  return result;
};

Tree.prototype.findNodeIn = function(needle, haystack) {
  var result = null;
  for (var i = 0; i < haystack.length; i++) {
    result = this.findNodeById(needle, haystack[i]);
    if (result) {
      return result;
    }
  }
  return result;
};

Tree.prototype.findNodeById = function(needle, nodes) {
  var self = this;
  var result = null;
  var haystack = nodes || this.tree;

  if (haystack.extra.id === needle) {
    return haystack;
  }

  result = this.findNodeIn(needle, haystack.children);
  if (result) {
    return result;
  }

  haystack.marriages.some(function(marriage) {
    if (marriage.spouse.extra.id === needle) {
      result = marriage.spouse;
      return true;
    }
    result = self.findNodeIn(needle, marriage.children);
    return !!result;
  });

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
    haystack.children.some(function(child) {
      var found = self.findParentById(needle, child);
      if (found) {
        result = found;
        return true;
      }
      return false;
    });
    if (result) {
      return result;
    }
  }

  if (haystack.marriages.length) {
    haystack.marriages.some(function(marriage) {
      return marriage.children.some(function(child) {
        var found = self.findParentById(needle, child);
        if (found) {
          result = found;
          return true;
        }
        return false;
      });
    });
  }

  return result;
};
