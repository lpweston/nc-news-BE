# News Northcoders API

Project to serve API for Northcoders News: a forum for northcoders to discuss various topics on. It has been [deployed here](https://news-northcoders.herokuapp.com/api/articles)

The front-end has been [deployed here](https://news-nc.netlify.com), and the [git repository is here](https://github.com/lpweston/nc-news).

The server is built using Express web framework. The database is PSQL and Knex is used to interact with it. The API is hosted on Heroku.

It was built using TDD using mocha, chai (with chai-sorted) and supertest.

## Getting Started

Clone the repo and change directory into it

```
git clone https://github.com/lpweston/nc-news
cd be-nc-news
```

## Prerequistes

Requires NodeJS, Node Package Manager (npm)
Javascript code is written to ES6 standard.
Requires psql.

## Installing

Install the required dependencies

```
npm install
```

You will need to make a new file in the root directory: knexfile.js with the following content:

```javascript
const { DB_URL } = process.env;

const baseConfig = {
  client: "pg",
  migrations: {
    directory: "./db/migrations"
  },
  seeds: {
    directory: "./db/seeds"
  }
};

const customConfigs = {
  development: {
    connection: {
      database: "nc_news"
      //username: "",
      //password: ""
    }
  },
  test: {
    connection: {
      database: "nc_news_test"
      //username: "",
      //password: ""
    }
  }
};

module.exports = { ...customConfigs[ENV], ...baseConfig };
```

where ubuntu users will need to input their psql usernames and passwords

Set up the databases

```
npm run setup-dbs
```

## Running the tests

You can run the test suite for the API

```
npm test
```

### Tests

Tests check the correct working of each valid endpoint. As well as for error handling on each path.

For example:

```
/api
    /users
        /:username
            405 Status: invalid methods
            GET
                200 Status: responds with a user object
                404 Status: error when username doesn't exist
```

The first test on this route tries to run PUT, PATCH and DELETE methods on the path `/api/user/:username`, where `:username` is a valid username, it checks for a returning a 405 status.
Next it tries a GET method on the same path and checks that the users information is returned.
Finally an invalid username is given and it checks for a 404 status.

## End Points

- GET /api - serves up a json representation of all the available endpoints of the api
- GET /api/topics - serves an array of all topics
- POST /api/topics - creates a new topic
- GET /api/users - serves an array of users
- POST /api/users - creates a new user
- GET /api/users/:username - serves a user
- GET /api/articles - serves an array of all articles
- POST /api/articles - creates a new article
- GET /api/articles/:article_id - serves an article
- PATCH /api/articles/:article_id - increments the vote of an article
- DELETE /api/artiles/:article_id - deletes an article and its comments
- POST /api/articles/:article_id/comments - posts a new comment to an article
- GET /api/articles/:article_id/comments - serves an array of comments for an article
- PATCH /api/comments/:comment_id - increments the vote of a comment
- DELETE /api/comments/:comment_id - deletes a comment

## Built With

- [Express](http://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Knex](https://knexjs.org/) - SQL query builder
- [Heroku](https://heroku.com) - Hosting
