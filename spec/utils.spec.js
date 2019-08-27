const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("takes an array of objects without a created_at property and returns a matching array of objects", () => {
    expect(formatDates([{}])).to.eql([{}]);
  });
  it("takes an array with an object containing a time in unix timestamp and returns it in the form of a Date class", () => {
    expect(formatDates([{ created_at: 1 }])).to.eql([
      { created_at: new Date(1) }
    ]);
  });
  it("takes an array of multiple objects and returns it in a Date class", () => {
    expect(formatDates([{ created_at: 1 }, { created_at: 2 }])).to.eql([
      { created_at: new Date(1) },
      { created_at: new Date(2) }
    ]);
  });
  it("doesn't change the properties in the object", () => {
    const input = [
      { A: 1, B: 2, created_at: 3 },
      { D: 4, E: 5, created_at: 6 }
    ];
    const expectedOutput = [
      { A: 1, B: 2, created_at: new Date(3) },
      { D: 4, E: 5, created_at: new Date(6) }
    ];
    expect(formatDates(input)).to.eql(expectedOutput);
  });
});

describe("makeRefObj", () => {
  it("takes an empty array and returns an empty object", () => {
    const input = [];
    const expectedOutput = {};
    const output = makeRefObj(input);
    expect(output).to.eql(expectedOutput);
  });
  it("takes an array with an objects and 2 keys and returns an object with their values as a key value pair", () => {
    const input = [{ article_id: 1, title: "A" }];
    const expectedOutput = { A: 1 };
    expect(makeRefObj(input, "title", "article_id")).to.eql(expectedOutput);
  });
  it("takes an array with multile objects and 2 keys and returns an object with their values as a key value pairs", () => {
    const input = [
      { article_id: 1, title: "A" },
      { article_id: 2, title: "B" },
      { article_id: 3, title: "C" }
    ];
    const expectedOutput = { A: 1, B: 2, C: 3 };
    expect(makeRefObj(input, "title", "article_id")).to.eql(expectedOutput);
  });
});

describe("formatComments", () => {
  it("takes an array and returns a new array", () => {
    const input = [];
    const ref = {};
    expect(formatComments(input, ref)).eql([]);
    expect(formatComments(input, ref)).not.to.equal(input);
  });
  it("takes an array of objects and formats the time", () => {
    const input = [
      {
        body: "The beautiful thing about treasure is that it exists.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      }
    ];
    const refObj = {
      "article title": 36,
      "Living in the shadow of a great man": 24
    };
    const expectedTime = new Date(1479818163389);
    expect(formatComments(input, refObj)[0].created_at).to.eql(expectedTime);
  });
  it("takes an array of objects and changes the created_by key to a author key", () => {
    const input = [
      {
        body: "The beautiful thing about treasure is that it exists.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      }
    ];
    const refObj = {
      "article title": 36,
      "Living in the shadow of a great man": 24
    };
    expect(formatComments(input, refObj)[0].author).to.equal("butter_bridge");
  });
  it("takes an array of objects and an article reference and returns an article id", () => {
    const input = [
      {
        body: "The beautiful thing about treasure is that it exists.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      }
    ];
    const refObj = {
      "article title": 36,
      "Living in the shadow of a great man": 24
    };
    expect(formatComments(input, refObj)[0].article_id).to.equal(24);
  });
});
