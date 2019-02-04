const expect = chai.expect;

describe("Tree", () => {
  const MANAIA_NODE = {
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
  let t = null;

  beforeEach(() => {
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
      expect(parent).to.equal(null);
    });
  });
});
