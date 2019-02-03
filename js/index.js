var whakapapa = new Tree({
  extra: {
    id: "292203a6-7ba5-43d6-9eb0-e526a2cbe282"
  },
  name: "Manawa",
  children: [],
  marriages: [
    {
      spouse: {
        extra: {
          id: "6a29f0c3-5d03-458a-8bff-7e478c7bbdf1"
        },
        name: "Kahu",
        children: [],
        marriages: []
      },
      children: [
        {
          extra: {
            id: "f95cfd2d-23bc-4f71-8b91-007ee39c4a93"
          },
          name: "Rawiri",
          children: [],
          marriages: [
            {
              spouse: {
                extra: {
                  id: "7ac3269c-b37c-43d4-80bc-81bab843d515"
                },
                name: "Awhina",
                children: [],
                marriages: []
              },
              children: [
                {
                  extra: {
                    id: "61b5a735-b396-4aac-909b-273551d3395e"
                  },
                  name: "Tui",
                  children: [],
                  marriages: []
                }
              ]
            },
            {
              spouse: {
                extra: {
                  id: "5abacf1b-b194-4904-9b62-f11c2cb0119d"
                },
                name: "Kaia",
                children: [],
                marriages: []
              },
              children: [
                {
                  extra: {
                    id: "dab85dc6-8bcc-4ec1-93b8-edad8917dbb7"
                  },
                  name: "Manaia",
                  children: [],
                  marriages: []
                }
              ]
            }
          ]
        },
        {
          extra: {
            id: "e86dd806-d3ba-4c50-a52e-8a076359a750"
          },
          name: "Te Aroha",
          children: [],
          marriages: []
        }
      ]
    }
  ]
});

// var menu = [
//   {
//     title: "Rename node",
//     action: function(elm, d, i) {
//       console.log("Rename node");
//       $("#RenameNodeName").val(d.name);
//       rename_node_modal_active = true;
//       node_to_rename = d;
//       $("#RenameNodeName").focus();
//       $("#RenameNodeModal").foundation("reveal", "open");
//     }
//   },
//   {
//     title: "Delete node",
//     action: function(elm, d, i) {
//       console.log("Delete node");
//       delete_node(d);
//     }
//   },
//   {
//     title: "Create child node",
//     action: function(elm, d, i) {
//       console.log("Create child node");
//       create_node_parent = d;
//       create_node_modal_active = true;
//       $("#CreateNodeModal").foundation("reveal", "open");
//       $("#CreateNodeName").focus();
//     }
//   },
//   {
//     title: "Create sibling node",
//     action: function(elm, d, i) {
//       console.log("Create sibling node");
//       create_node_parent = d;
//       create_node_modal_active = true;
//       $("#CreateNodeModalSibling").foundation("reveal", "open");
//       $("#CreateNodeNameSibling").focus();
//     }
//   },
//   {
//     title: "Create parent node",
//     action: function(elm, d, i) {
//       console.log("Create parent node");
//       create_node_parent = d;
//       create_node_modal_active = true;
//       $("#CreateNodeModalParent").foundation("reveal", "open");
//       $("#CreateNodeNameParent").focus();
//     }
//   }
// ];
//

function createChild() {
  try {
    var name = $("#CreateNodeName").val();
    var nodeId = $("#CreateNodeModal").data("nodeId");
    var parent = whakapapa.findNodeById(nodeId);
    whakapapa.addChild({ name: name }, parent);

    $("#CreateNodeName").val("");
    updateTree();
  } catch (e) {
    $("#error-message").text(e.message);
  }
  closeModal("#CreateNodeModal");
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
    $("#error-message").text(e.message);
  }
  closeModal("#CreateNodeModalSibling");
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
    $("#error-message").text(e.message);
  }
  closeModal("#CreateNodeModalParent");
}

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

function openModal(id) {
  $(id).focus();
  $(id).foundation("open");
}

function closeModal(id) {
  $(id).foundation("close");
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

updateTree();
