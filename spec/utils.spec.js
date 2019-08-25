const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("takes an array with an object with a time in unix timestamp and returns it as an SQL comptaible timestamp", () => {
    expect(formatDates([{ created_at: 1471522072389 }])).to.eql([
      { created_at: "2016-08-18T12:07:52.389Z" }
    ]);
  });
  it("takes an array of multiple objects and returns it as an SQL comptaible timestamp", () => {
    expect(
      formatDates([
        { created_at: 1471522072389 },
        { created_at: 1500584273256 }
      ])
    ).to.eql([
      { created_at: "2016-08-18T12:07:52.389Z" },
      { created_at: "2017-07-20T20:57:53.256Z" }
    ]);
  });
  it("doesn't change the properties in the object", () => {
    const input = [
      {
        title: "Running a Node App",
        topic: "coding",
        author: "jessjelly",
        body: "words and stuff",
        created_at: 1471522072389
      },
      {
        title:
          "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: "coding",
        author: "jessjelly",
        body: "words and stuff",
        created_at: 1500584273256
      }
    ];
    const expectedOutput = [
      {
        title: "Running a Node App",
        topic: "coding",
        author: "jessjelly",
        body: "words and stuff",
        created_at: "2016-08-18T12:07:52.389Z"
      },
      {
        title:
          "The Rise Of Thinking Machines: How IBM's Watson Takes On The World",
        topic: "coding",
        author: "jessjelly",
        body: "words and stuff",
        created_at: "2017-07-20T20:57:53.256Z"
      }
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
    const expectedTime = "2016-11-22T12:36:03.389Z";
    expect(formatComments(input, refObj)[0].created_at).to.equal(expectedTime);
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
