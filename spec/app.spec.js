process.env.NODE_ENV = "test";
const app = require("../app");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-sorted"));
const request = require("supertest")(app);
const connection = require("../db/connection");

describe("/api", () => {
  beforeEach(() => connection.seed.run());
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
  describe("/articles", () => {
    describe("/:article_id", () => {
      it("405 status: invalid methods", () => {
        const invalidMethods = ["put", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request[method]("/api/articles/1")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
      describe("GET", () => {
        it("Status 200: responds with article object", () => {
          return request
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
              expect(body).to.be.an("object");
              expect(body.article).to.have.keys(
                "author",
                "title",
                "article_id",
                "body",
                "topic",
                "created_at",
                "votes",
                "comment_count"
              );
              expect(body.article.comment_count).to.equal("13");
            });
        });
        it("Status 400, responds with 'Syntax error' when article_id is not a number", () => {
          return request
            .get("/api/articles/article-name")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
        it("Status 404, responds with 'Article not found' when article_id doesnt exist", () => {
          return request
            .get("/api/articles/1000")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article not found");
            });
        });
      });
      describe("PATCH", () => {
        it("Status 200: responds with updated article", () => {
          return request
            .patch("/api/articles/1")
            .send({ inc_votes: 100 })
            .expect(200)
            .then(({ body }) => {
              expect(body.article.votes).to.equal(200);
            });
        });
        it("Status 400, no inc_votes sent", () => {
          return request
            .patch("/api/articles/1")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Could not find inc_votes on body");
            });
        });
        it("Status 400, invalid body sent", () => {
          return request
            .patch("/api/articles/1")
            .send({ inc_votes: "cat" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "Inc_votes syntax error, expected number"
              );
            });
        });
        it("Status 400, other information on body", () => {
          return request
            .patch("/api/articles/1")
            .send({ inc_votes: 100, name: "Laura" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Unexpected properties on body");
            });
        });
      });
      describe("/comments", () => {
        it("405 status: invalid methods", () => {
          const invalidMethods = ["patch", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request[method]("/api/articles/1/comments")
              .expect(405)
              .then(({ body: { msg } }) => {
                expect(msg).to.equal("method not allowed");
              });
          });
          return Promise.all(methodPromises);
        });
        describe("POST", () => {
          it("Status 201: responds with posted comment", () => {
            return request
              .post("/api/articles/1/comments")
              .send({ username: "lurker", body: "here is a comment" })
              .expect(201)
              .then(({ body }) => {
                expect(body.comment).to.have.keys(
                  "comment_id",
                  "author",
                  "article_id",
                  "votes",
                  "created_at",
                  "body"
                );
              });
          });
          it("Status 400, username or data not sent", () => {
            return request
              .post("/api/articles/1/comments")
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Missing either username or body");
              });
          });
          it("Status 400, other information on body", () => {
            return request
              .post("/api/articles/1/comments")
              .send({ username: "lurker", body: "here is a comment", id: 5 })
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Unexpected properties on body");
              });
          });
        });
        describe("GET", () => {
          it("Status 200: responds with array of comments", () => {
            return request
              .get("/api/articles/1/comments")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.an("array");
                expect(body.comments[0]).to.have.keys(
                  "comment_id",
                  "author",
                  "votes",
                  "created_at",
                  "body"
                );
              });
          });
          it("Status 400, responds with 'Syntax error' when article_id is not a number", () => {
            return request
              .get("/api/articles/article-name/comments")
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Syntax error, input not valid");
              });
          });
          it("Status 404, responds with 'Article not found' when article_id doesnt exist", () => {
            return request
              .get("/api/articles/1000/comments")
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal("Comments not found");
              });
          });
          it("Status 200: default sort_by created_by", () => {
            return request
              .get("/api/articles/1/comments")
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.comments.map(({ created_at }) => Date.parse(created_at))
                ).to.be.descending;
              });
          });
          it("Status 200: with sort_by and order queries", () => {
            return request
              .get("/api/articles/1/comments?sort_by=votes&order=asc")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy("votes");
              });
          });
          it("Status 400: bad request, when incorrect sort_by or order query given", () => {
            return request
              .get("/api/articles/1/comments?sort_by=random&order=desc")
              .expect(400)
              .then(result => {
                expect(result.body.msg).to.equal(
                  "Syntax error, input not valid"
                );
              });
          });
        });
      });
    });
  });
});
