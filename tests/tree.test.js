const expect = chai.expect;

describe("Tree", () => {
  let MANAIA_NODE = null;
  let t = null;

  beforeEach(() => {
    MANAIA_NODE = {
      extra: { id: "dab85dc6-8bcc-4ec1-93b8-edad8917dbb7" },
      name: "Manaia",
      children: [
        {
          extra: {
            id: "6a59f9d6-6d61-4701-93a0-3ca6d24edd8e"
          },
          marriages: [],
          children: [],
          name: "Anahera"
        }
      ],
      marriages: [
        {
          spouse: {
            extra: {
              id: "2661d03f-e898-46da-8fc7-c9fcbe16dba2"
            },
            marriages: [],
            children: [],
            name: "Tane"
          },
          children: [
            {
              extra: {
                id: "a5847247-a3eb-45ff-86a3-a27fdb15f209"
              },
              marriages: [],
              children: [],
              name: "Nikau"
            }
          ]
        }
      ]
    };

    t = new Tree({
      extra: { id: "292203a6-7ba5-43d6-9eb0-e526a2cbe282" },
      name: "Manawa",
      children: [],
      marriages: [
        {
          spouse: {
            extra: { id: "6a29f0c3-5d03-458a-8bff-7e478c7bbdf1" },
            name: "Kahu",
            children: [],
            marriages: []
          },
          children: [
            {
              extra: { id: "f95cfd2d-23bc-4f71-8b91-007ee39c4a93" },
              name: "Rawiri",
              children: [],
              marriages: [
                {
                  spouse: {
                    extra: { id: "7ac3269c-b37c-43d4-80bc-81bab843d515" },
                    name: "Awhina",
                    children: [],
                    marriages: []
                  },
                  children: [
                    {
                      extra: { id: "61b5a735-b396-4aac-909b-273551d3395e" },
                      name: "Tui",
                      children: [],
                      marriages: []
                    }
                  ]
                },
                {
                  spouse: {
                    extra: { id: "5abacf1b-b194-4904-9b62-f11c2cb0119d" },
                    name: "Kaia",
                    children: [],
                    marriages: []
                  },
                  children: [MANAIA_NODE]
                }
              ]
            },
            {
              extra: { id: "e86dd806-d3ba-4c50-a52e-8a076359a750" },
              name: "Te Aroha",
              children: [],
              marriages: []
            }
          ]
        }
      ]
    });
  });

  describe("findNodeById", () => {
    it("finds a node", () => {
      const node = t.findNodeById(MANAIA_NODE.extra.id);
      expect(node).to.deep.equal(MANAIA_NODE);
    });

    it("returns null for a non-existent node", () => {
      const node = t.findNodeById("12345");
      expect(node).to.equal(null);
    });
  });

  describe("findMarriageBySpouseId", () => {
    it("finds a marriage", () => {
      const spouseId = MANAIA_NODE.marriages[0].spouse.extra.id;
      const marriage = t.findMarriageBySpouseId(spouseId);
      expect(marriage).to.deep.equal(MANAIA_NODE.marriages[0]);
    });

    it("returns null for a non-spouse", () => {
      const marriage = t.findMarriageBySpouseId(MANAIA_NODE.extra.id);
      expect(marriage).to.equal(null);
    });
  });

  describe("hasChild", () => {
    it("returns true if child in children", () => {
      const childId = MANAIA_NODE.children[0].extra.id;
      const hasChild = t.hasChild(childId, MANAIA_NODE);
      expect(hasChild).to.be.true;
    });

    it("returns true if child in marriages", () => {
      const childId = MANAIA_NODE.marriages[0].children[0].extra.id;
      const hasChild = t.hasChild(childId, MANAIA_NODE);
      expect(hasChild).to.be.true;
    });

    it("returns false if node exists but not a child", () => {
      const nodeId = t.tree.marriages[0].children[0].extra.id;
      const hasChild = t.hasChild(nodeId, MANAIA_NODE);
      expect(hasChild).to.be.false;
    });

    it("returns false for non-existent node", () => {
      const hasChild = t.hasChild("12345", MANAIA_NODE);
      expect(hasChild).to.be.false;
    });
  });

  describe("findParentById", () => {
    it("finds the parent from .children", () => {
      const childId = MANAIA_NODE.children[0].extra.id;
      const parent = t.findParentById(childId);
      expect(parent).to.deep.equal(MANAIA_NODE);
    });

    it("finds the parent from .marriages", () => {
      const childId = MANAIA_NODE.marriages[0].children[0].extra.id;
      const parent = t.findParentById(childId);
      expect(parent).to.deep.equal(MANAIA_NODE);
    });

    it("returns null if no parent", () => {
      const parent = t.findParentById(t.tree.extra.id);
      expect(parent).to.be.null;
    });
  });

  describe("addParent", () => {
    it("throws if no child provided", () => {
      expect(() => t.addParent({ name: "abcde" })).to.throw(/child/);
    });

    it("throws if spouse", () => {
      const spouse = MANAIA_NODE.marriages[0].spouse;
      expect(() => t.addParent({ name: "abcde" }, spouse)).to.throw(/spouse/);
    });

    it("throws if two parents already exist", () => {
      const child = MANAIA_NODE.marriages[0].children[0];
      expect(() => t.addParent({ name: "abcde" }, child)).to.throw(
        /more than two/
      );
    });

    it("moves the child to .children", () => {
      const child = t.tree;
      t.addParent({ name: "abcde" }, child);
      expect(t.tree.children.find(c => c.extra.id === child.extra.id)).to.be.ok;
    });

    it("creates a new root node", () => {
      const child = t.tree;
      t.addParent({ name: "abcde" }, child);
      expect(t.tree.name).to.equal("abcde");
    });

    it("adds a 'marriage' if a single parent already exists", () => {
      const child = MANAIA_NODE.children[0];
      const marriages = MANAIA_NODE.marriages.length;
      t.addParent({ name: "abcde" }, child);
      expect(MANAIA_NODE.marriages.length).to.equal(marriages + 1);
    });

    it("moves child from .children to .marriages if a single parent already exists", () => {
      const child = MANAIA_NODE.children[0];
      t.addParent({ name: "abcde" }, child);
      const marriage = MANAIA_NODE.marriages[MANAIA_NODE.marriages.length - 1];
      expect(marriage.children[0].extra.id).to.equal(child.extra.id);
    });
  });

  describe("addChild", () => {
    it("throws if no parent provided", () => {
      expect(() => t.addChild({ name: "abcde" })).to.throw(/parent/);
    });

    it("adds to .children if .marriages empty", () => {
      const parent = MANAIA_NODE.marriages[0].children[0];
      t.addChild({ name: "abcde" }, parent);
      expect(parent.children.find(c => c.name === "abcde")).to.be.ok;
    });

    it("adds to .marriages if one exists", () => {
      t.addChild({ name: "abcde" }, MANAIA_NODE);
      expect(MANAIA_NODE.marriages[0].children.find(c => c.name === "abcde")).to
        .be.ok;
    });

    it("adds to .marriages if parent is spouse", () => {
      t.addChild({ name: "abcde" }, MANAIA_NODE.marriages[0].spouse);
      expect(MANAIA_NODE.marriages[0].children.find(c => c.name === "abcde")).to
        .be.ok;
    });
  });

  describe("addSibling", () => {
    it("throws if no parent", () => {
      expect(() => t.addSibling({ name: "abcde" })).to.throw(/parent/);
    });

    it("throws if spouse", () => {
      const spouseId = MANAIA_NODE.marriages[0].spouse.extra.id;
      const parent = t.tree.marriages[0].children[0];
      expect(() => t.addSibling({ name: "abcde" }, parent, spouseId)).to.throw(
        /spouse/
      );
    });

    it("adds a sibling in a marriage", () => {
      const childId = MANAIA_NODE.marriages[0].children[0].extra.id;
      const parent = MANAIA_NODE;
      t.addSibling({ name: "abcde" }, parent, childId);
      const sibling = MANAIA_NODE.marriages[0].children.find(
        c => c.name === "abcde"
      );
      expect(sibling).to.be.ok;
    });

    it("adds a sibling in .children", () => {
      const childId = MANAIA_NODE.children[0].extra.id;
      const parent = MANAIA_NODE;
      t.addSibling({ name: "abcde" }, parent, childId);
      const sibling = MANAIA_NODE.children.find(c => c.name === "abcde");
      expect(sibling).to.be.ok;
    });
  });

  describe("renameNodeById", () => {
    it("throws if id doesn't exist", () => {
      expect(() => t.renameNodeById("12345", "abcde")).to.throw(
        /find that node/
      );
    });

    it("renames a node", () => {
      t.renameNodeById(MANAIA_NODE.extra.id, "abcde");
      expect(MANAIA_NODE.name).to.equal("abcde");
    });
  });
});
