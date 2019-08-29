process.env.NODE_ENV = "test";
const app = require("../app");
const chai = require("chai");
const apiJSON = require("../endpoints.json");
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
  it("405 status: invalid methods", () => {
    const invalidMethods = ["put", "patch", "delete"];
    const methodPromises = invalidMethods.map(method => {
      return request[method]("/api")
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("method not allowed");
        });
    });
    return Promise.all(methodPromises);
  });
  describe("GET", () => {
    it("200 Status: responds with JSON describing endpoints on the API", () => {
      return request
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.eql(apiJSON);
        });
    });
  });
  describe("/topics", () => {
    describe("GET", () => {
      it("200 Status: responds with an array of topic objects", () => {
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
  describe("/users", () => {
    it("405 status: invalid methods", () => {
      const invalidMethods = ["get", "patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request[method]("/api/users")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("/:username", () => {
      it("405 status: invalid methods", () => {
        const invalidMethods = ["patch", "put", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request[method]("/api/users/1")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
      describe("GET", () => {
        it("200 Status: responds with a user object", () => {
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
        it("404 Status: error when username doesnt exist", () => {
          return request
            .get("/api/users/not_a_name")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("User not found");
            });
        });
      });
    });
  });
  describe("/articles", () => {
    it("405 status: invalid methods", () => {
      const invalidMethods = ["patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request[method]("/api/articles")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("GET", () => {
      it("200 Status: responds with array of articles", () => {
        return request
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0]).to.have.keys(
              "author",
              "title",
              "article_id",
              "topic",
              "created_at",
              "votes",
              "comment_count"
            );
          });
      });
      describe("Sort_by and order tests", () => {
        it("200 Status: sorts by date dec, by default", () => {
          return request
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
              expect(
                body.articles.map(({ created_at }) => Date.parse(created_at))
              ).to.be.descending;
            });
        });
        it("200 Status: with sort_by and order queries", () => {
          return request
            .get("/api/articles?sort_by=votes&order=asc")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.be.sortedBy("votes");
            });
        });
        it("400 Status: sort_by column doesnt exist", () => {
          return request
            .get("/api/articles?sort_by=name")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Query invalid, column not found");
            });
        });
        it("400 Status: order not correct", () => {
          return request
            .get("/api/articles?sort_by=votes&order=4")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "Query error, order input should be asc or desc"
              );
            });
        });
      });
      describe("Author and topic query tests", () => {
        it("200 Status: takes an author query which filters results by username", () => {
          return request
            .get("/api/articles?author=butter_bridge")
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => {
                expect(article.author).to.equal("butter_bridge");
              });
            });
        });
        it("200 Status: takes a topic query which filters results by topic id", () => {
          return request
            .get("/api/articles?topic=mitch")
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach(article => {
                expect(article.topic).to.equal("mitch");
              });
            });
        });
        it("404 Status: author doesnt exist", () => {
          return request
            .get("/api/articles?author=me")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article/s not found");
            });
        });
        it("404 Status: topic doesnt exist", () => {
          return request
            .get("/api/articles?topic=me")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article/s not found");
            });
        });
      });
      describe("Limit and page query tests", () => {
        it("200 Status: by default it limits to 10 responces", () => {
          return request
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles.length).to.equal(10);
            });
        });
        it("200 Status: takes a limit and responds with that number of articles", () => {
          return request
            .get("/api/articles?limit=5")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles.length).to.equal(5);
            });
        });
        it("200 Status: takes a 'p' page number and responds with that page", () => {
          const urls = ["/api/articles?limit=2", "/api/articles?limit=1&p=2"];
          const promises = urls.map(url => {
            return request.get(url);
          });
          return Promise.all(promises).then(([twoArticles, secondArticle]) => {
            expect(twoArticles.body.articles[1]).to.eql(
              secondArticle.body.article
            );
          });
        });
        it("400 Status: when limit is negative", () => {
          return request
            .get("/api/articles?limit=-1")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Limit must not be negative");
            });
        });
        it("200 Status: gives a total count", () => {
          return request
            .get("/api/articles?limit=5")
            .expect(200)
            .then(({ body }) => {
              expect(parseInt(body.total_count)).to.be.a("number");
              expect(parseInt(body.total_count)).to.equal(12);
            });
        });
        it("200 Status: gives a total count when filters are used", () => {
          return request
            .get("/api/articles?topic=cats")
            .expect(200)
            .then(({ body }) => {
              expect(parseInt(body.total_count)).to.be.a("number");
              expect(parseInt(body.total_count)).to.equal(1);
            });
        });
      });
    });
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
        it("200 Status: responds with article object", () => {
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
        it("400 Status: responds with 'Syntax error' when article_id is not a number", () => {
          return request
            .get("/api/articles/article-name")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
        it("404 Status: responds with 'Article/s not found' when article_id doesnt exist", () => {
          return request
            .get("/api/articles/1000")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article/s not found");
            });
        });
      });
      describe("PATCH", () => {
        it("200 Status: responds with updated article", () => {
          return request
            .patch("/api/articles/1")
            .send({ inc_votes: 100 })
            .expect(200)
            .then(({ body }) => {
              expect(body.article.votes).to.equal(200);
            });
        });
        it("400 Status: responds with 'Syntax error' when article_id is not a number", () => {
          return request
            .patch("/api/articles/article-name")
            .send({ inc_votes: 100 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
        it("404 Status: responds with 'Article/s not found' when article_id doesnt exist", () => {
          return request
            .patch("/api/articles/1000")
            .send({ inc_votes: 100 })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Article not found");
            });
        });
        it("400 Status: no inc_votes sent", () => {
          return request
            .patch("/api/articles/1")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Could not find inc_votes on body");
            });
        });
        it("400 Status: invalid body sent", () => {
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
        it("400 Status: other information on body", () => {
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
          it("201 Status: responds with posted comment", () => {
            return request
              .post("/api/articles/3/comments")
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
          it("400 Status: article_id not valid", () => {
            return request
              .post("/api/articles/mitch/comments")
              .send({ username: "lurker", body: "here is a comment" })
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Syntax error, input not valid");
              });
          });
          it("422 Status: article_id not found", () => {
            return request
              .post("/api/articles/30/comments")
              .send({ username: "lurker", body: "here is a comment" })
              .expect(422)
              .then(({ body }) => {
                expect(body.msg).to.equal(
                  "Foreign_key_violation: one of your inputs was not found"
                );
              });
          });
          it("400 Status: username not sent", () => {
            return request
              .post("/api/articles/1/comments")
              .send({ body: "here is a comment" })
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Missing username");
              });
          });
          it("422 Status: username not found", () => {
            return request
              .post("/api/articles/1/comments")
              .send({ username: "some_user", body: "here is a comment" })
              .expect(422)
              .then(({ body }) => {
                expect(body.msg).to.equal(
                  "Foreign_key_violation: one of your inputs was not found"
                );
              });
          });
          it("400 Status: comment body not sent", () => {
            return request
              .post("/api/articles/1/comments")
              .send({ username: "lurker" })
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Missing comment body");
              });
          });
          it("400 Status: other information on body", () => {
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
          it("200 Status: responds with array of comments", () => {
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
          it("400 Status: responds with 'Syntax error' when article_id is not a number", () => {
            return request
              .get("/api/articles/article-name/comments")
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal("Syntax error, input not valid");
              });
          });
          it("404 Status: responds with 'Article not found' when article_id doesnt exist", () => {
            return request
              .get("/api/articles/1000/comments")
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal("Article/s not found");
              });
          });
          it("200 Status: responds with empty array when article_id doesnt have any comments", () => {
            return request
              .get("/api/articles/2/comments")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.eql([]);
              });
          });
          it("200 Status: default sort_by created_by desc", () => {
            return request
              .get("/api/articles/1/comments")
              .expect(200)
              .then(({ body }) => {
                expect(
                  body.comments.map(({ created_at }) => Date.parse(created_at))
                ).to.be.descending;
              });
          });
          it("200 Status: with valid sort_by and order queries", () => {
            return request
              .get("/api/articles/1/comments?sort_by=votes&order=asc")
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy("votes");
              });
          });
          it("400 Status: bad request, when incorrect sort_by", () => {
            return request
              .get("/api/articles/1/comments?sort_by=random")
              .expect(400)
              .then(result => {
                expect(result.body.msg).to.equal(
                  "Query invalid, column not found"
                );
              });
          });
          it("400 Status: bad request, when incorrect order", () => {
            return request
              .get("/api/articles/1/comments?order=down")
              .expect(400)
              .then(result => {
                expect(result.body.msg).to.equal(
                  "Query error, order input should be asc or desc"
                );
              });
          });
          describe("Limit and page query tests", () => {
            it("200 Status: by default it limits to 10 responces", () => {
              return request
                .get("/api/articles/1/comments")
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments.length).to.equal(10);
                });
            });
            it("200 Status: takes a limit and responds with that number of articles", () => {
              return request
                .get("/api/articles/1/comments?limit=5")
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments.length).to.equal(5);
                });
            });
            it("200 Status: takes a 'p' page number and responds with that page", () => {
              const urls = [
                "/api/articles/1/comments?limit=2",
                "/api/articles/1/comments?limit=1&p=2"
              ];
              const promises = urls.map(url => {
                return request.get(url);
              });
              return Promise.all(promises).then(
                ([twoComments, secondComment]) => {
                  expect(twoComments.body.comments[1]).to.eql(
                    secondComment.body.comments[0]
                  );
                }
              );
            });
            it("400 Status: when limit is negative", () => {
              return request
                .get("/api/articles/1/comments?limit=-1")
                .expect(400)
                .then(({ body }) => {
                  expect(body.msg).to.equal("Limit must not be negative");
                });
            });
            it("200 Status: gives a total count", () => {
              return request
                .get("/api/articles/1/comments?limit=5")
                .expect(200)
                .then(({ body }) => {
                  expect(parseInt(body.total_count)).to.be.a("number");
                  expect(parseInt(body.total_count)).to.equal(13);
                });
            });
          });
        });
      });
    });
  });
  describe("/comments", () => {
    it("405 status: invalid methods", () => {
      const invalidMethods = ["get", "put", "patch", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request[method]("/api/comments")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("/:comment_id", () => {
      it("405 status: invalid methods", () => {
        const invalidMethods = ["get", "put"];
        const methodPromises = invalidMethods.map(method => {
          return request[method]("/api/comments/1")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
      describe("PATCH", () => {
        it("200 Status: responds with updated comment", () => {
          return request
            .patch("/api/comments/1")
            .send({ inc_votes: -10 })
            .expect(200)
            .then(({ body }) => {
              expect(body.comment.votes).to.equal(6);
            });
        });
        it("400 Status: no inc_votes sent", () => {
          return request
            .patch("/api/comments/1")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Could not find inc_votes on body");
            });
        });
        it("400 Status: invalid body sent", () => {
          return request
            .patch("/api/comments/1")
            .send({ inc_votes: "cat" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "Inc_votes syntax error, expected number"
              );
            });
        });
        it("400 Status: other information on body", () => {
          return request
            .patch("/api/comments/1")
            .send({ inc_votes: 100, name: "laura" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Unexpected properties on body");
            });
        });
        it("400 Status: when comment_id not a number", () => {
          return request
            .patch("/api/comments/word")
            .send({ inc_votes: 100 })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
        it("404 Status: when comment_id not found", () => {
          return request
            .patch("/api/comments/1000")
            .send({ inc_votes: 100 })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Comment not found");
            });
        });
      });
      describe("DELETE", () => {
        it("204 Status: returns nothing", () => {
          return request.delete("/api/comments/1").expect(204);
        });
        it("400 Status: responds with 'Syntax error' when comment_id is not a number", () => {
          return request
            .delete("/api/comments/comment-name")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
        it("404 Status: responds with 'Comment not found' when comment_id doesnt exist", () => {
          return request
            .delete("/api/comments/1000")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("Comment not found");
            });
        });
        it("400 Status: when comment_id is not a number", () => {
          return request
            .delete("/api/comments/dave")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("Syntax error, input not valid");
            });
        });
      });
    });
  });
});
