var whakapapa = null;

function loadTree() {
  $.get("/tree", function(data) {
    whakapapa = new Tree(JSON.parse(data));
    updateTree();
  }).fail(function() {
    toastr.error("Couldn't load tree.");
  });
}

loadTree();

function updateTree() {
  // TODO: Ideally, would be nice not to recreate the whole graph on changes.
  $("#tree-container").empty();
  dTree.init([whakapapa.tree], {
    target: "#tree-container",
    callbacks: {
      nodeRightClick: contextMenu
    },
    height: 800,
    width: 800
  });
}

function contextMenu(name, extra, id) {
  var $target = $(d3.event.target);
  var contextMenu = new Foundation.ContextMenu($target, {
    position: d3.event,
    structure: [
      {
        text: "Rename",
        click: function() {
          $("#RenameNodeName").val(name);
          $("#RenameNodeModal").data("nodeId", extra.id);
          openModal("#RenameNodeModal");
        }
      },
      {
        text: "Create parent",
        click: function() {
          $("#CreateNodeModalParent").data("nodeId", extra.id);
          openModal("#CreateNodeModalParent");
        }
      },
      {
        text: "Create child",
        click: function() {
          $("#CreateNodeModal").data("nodeId", extra.id);
          openModal("#CreateNodeModal");
        }
      },
      {
        text: "Create sibling",
        click: function() {
          $("#CreateNodeModalSibling").data("nodeId", extra.id);
          openModal("#CreateNodeModalSibling");
        }
      }
    ]
  });

  $target.one("hide.zf.contextmenu", function() {
    contextMenu.destroy();
  });
}

function renameNode() {
  try {
    var name = $("#RenameNodeName").val();
    var nodeId = $("#RenameNodeModal").data("nodeId");
    whakapapa.renameNodeById(nodeId, name);

    $("#RenameNodeName").val("");
    updateTree();
  } catch (e) {
    showError(e);
  }
}

function createChild() {
  try {
    var name = $("#CreateNodeName").val();
    var nodeId = $("#CreateNodeModal").data("nodeId");
    var parent = whakapapa.findNodeById(nodeId);
    whakapapa.addChild({ name: name }, parent);

    $("#CreateNodeName").val("");
    updateTree();
  } catch (e) {
    showError(e);
  }
}

function createSibling() {
  try {
    var name = $("#CreateNodeNameSibling").val();
    var nodeId = $("#CreateNodeModalSibling").data("nodeId");
    var parent = whakapapa.findParentById(nodeId);
    whakapapa.addSibling({ name: name }, parent, nodeId);

    $("#CreateNodeNameSibling").val("");
    updateTree();
  } catch (e) {
    showError(e);
  }
}

function createParent() {
  try {
    var name = $("#CreateNodeNameParent").val();
    var nodeId = $("#CreateNodeModalParent").data("nodeId");
    var child = whakapapa.findNodeById(nodeId);
    whakapapa.addParent({ name: name }, child);

    $("#CreateNodeNameParent").val("");
    updateTree();
  } catch (e) {
    showError(e);
  }
}

function saveTree() {
  $.ajax({
    url: "/tree",
    type: "POST",
    data: JSON.stringify(whakapapa.tree),
    contentType: "application/json; charset=utf-8",
    success: function() {
      toastr.success("Tree saved.");
    },
    fail: function() {
      toastr.error("Couldn't save tree.");
    }
  });
}

function openModal(id) {
  clearError();
  $(id).focus();
  $(id).foundation("open");
}

function closeModal(id) {
  $(id).foundation("close");
}

function showError(err) {
  $("#error-message").text(err.message);
}

function clearError() {
  $("#error-message").empty();
}
