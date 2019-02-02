// Re-work tree using dTree library
var whakapapa = new Tree({
  id: "292203a6-7ba5-43d6-9eb0-e526a2cbe282",
  name: "Kahu",
  depthOffset: 1,
  extra: {},
  marriages: [
    {
      spouse: {
        id: "6a29f0c3-5d03-458a-8bff-7e478c7bbdf1",
        name: "Manawa"
      },
      children: [
        {
          id: "f95cfd2d-23bc-4f71-8b91-007ee39c4a93",
          name: "Rawiri",
          marriages: [
            {
              spouse: {
                id: "7ac3269c-b37c-43d4-80bc-81bab843d515",
                name: "Awhina"
              },
              children: [
                {
                  id: "61b5a735-b396-4aac-909b-273551d3395e",
                  name: "Tui"
                }
              ]
            }
          ]
        },
        {
          id: "e86dd806-d3ba-4c50-a52e-8a076359a750",
          name: "Te Aroha"
        }
      ]
    }
  ]
});

dTree.init([whakapapa.tree]);
