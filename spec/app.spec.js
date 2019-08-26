process.env.NODE_ENV = "test";
const app = require("../app");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-sorted"));
const request = require("supertest")(app);
const connection = require("../db/connection");

describe("/api", () => {
  after(() => connection.destroy());
  it("404 Status: bad path", () => {
    return request
      .get("/api/route-does-not-exist")
      .expect(404)
      .then(({ body }) => {
        expect(body).to.eql({ msg: "Path not found" });
      });
  });
  describe("/topics", () => {
    describe("GET", () => {
      it("Status 200, responds with an array of topic objects", () => {
        return request
          .get("/api/topics")
          .expect(200)
          .then(({ body }) => {
            const expectedResult = {
              topics: [
                {
                  slug: "mitch",
                  description: "The man, the Mitch, the legend"
                },
                { slug: "cats", description: "Not dogs" },
                { slug: "paper", description: "what books are made of" }
              ]
            };
            expect(body).to.eql(expectedResult);
          });
      });
    });
  });
});
