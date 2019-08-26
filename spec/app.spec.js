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
    it("405 status: invalid methods", () => {
      const invalidMethods = ["patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request[method]("/api/topics")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
  });
  describe("/users/:username", () => {
    it("405 status: invalid methods", () => {
      const invalidMethods = ["patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request[method]("/api/users/:username")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("GET", () => {
      it("Status 200, responds with a user object", () => {
        return request
          .get("/api/users/butter_bridge")
          .expect(200)
          .then(({ body }) => {
            const expectedResult = {
              user: {
                avatar_url:
                  "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
                name: "jonny",
                username: "butter_bridge"
              }
            };
            expect(body).to.eql(expectedResult);
          });
      });
      it("Status 400, responds with 'Bad input' when username doesnt exist", () => {
        return request
          .get("/api/users/not_a_name")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("Bad input");
          });
      });
    });
  });
});
