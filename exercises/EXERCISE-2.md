# Exercise 2 - Hello? Bonjour?

## Exercise 2.1 - Create a Document (`insertOne`)

As we learned in the last exercise, we don't have to manually create a database or collection. When creating a document, we pass it the database and the collection, if they exist, the item is added, if they do not, they are created and the item is added.

1. Inside of `📁 exercises`, create a file called `exercise-2.js`
2. Write a function `createGreeting`.

```js
const createGreeting = async (req, res) => {
  // temporary content... for testing purposes.
  console.log(req.body);
  res.status(200).json('ok');
};
```

3. You can refer to [Exercise 1](EXERCISE-1.md) if you can't remember specific requirements.
4. Create a `post` endpoint for this function ins `server.js`.

```js
.post('/ex-2/greeting', createGreeting)
```

5. Use Insomnia to send the following `body` to that endpoint.

```json
{
  "lang": "English",
  "_id": "EN",
  "hello": "Hello"
}
```

6. Test out the endpoint connection.

Once all of that is working we need to actually send the data to the database. We are going to build a function similar to the one in Exercise-1 but were going to make it more robust.

First and foremost, we need to handle errors that might occur when contacting the database. We will use the `assert` module.

7. Add [assert](https://www.npmjs.com/package/assert) as a dependency,

```bash
yarn add assert
```

and require it in `exercise-2.js`.

```js
const assert = require('assert');
```

8. Edit `createGreeting`. This time we will wrap our code in a `try / catch` to be able to grab any errors. That part is done for you.

```js
const createGreeting = async (req, res) => {
  try {
    // TODO: connect...
    // TODO: declare 'db'
    // We are using the 'exercises' database
    // and creating a new collection 'greetings'
  } catch (err) {
    console.log(err.stack);
  }

  // TODO: close...
};
```

9. Add the item to the database. Here we are declaring a variable `r` that will contain the response from the db server. We use `r.insertedCount` to validate that database received our document and added it to the collection. _Notice that the collection is called `greetings`_. Add these lines within the `try`.

```js
const r = await db.collection('greetings').insertOne(req.body);
assert.equal(1, r.insertedCount);
```

10. Before we run the request in insomnia we need to create the `res`ponses.

```js
// On success, send
res.status(201).json({ status: 201, data: req.body });

// on failure, send
res.status(500).json({ status: 500, data: req.body, message: err.message });
```

11. Time to try it out in Insomnia!
12. Try to send the same data a second time. Do we get an error? What is it?
13. Add another item.

```json
{
  "lang": "French",
  "_id": "FR",
  "hello": "Bonjour"
}
```

---

## Exercise 2.2 - Add More than One (`insertMany`)

Take a look at [`greetings.json`](../data/greetings.json). It contains data that needs to be transferred to our database. You could copy/paste each one into Insomnia and add them using the function you created in `2.1` but that would a little inefficient.

Instead, let's write a utility function that will migrate all of the data for us.

1. Create a file called `batchImport.js` in the root of the project. This file/function will be called from the terminal and run with `node`.
2. Add/Install the [`file-system`](https://www.npmjs.com/package/file-system) module.
3. Require it at the top of the `batchImpotr.js` file.
4. Declare a variable and assign it the contents of `greetings.json` like so:

```js
const greetings = JSON.parse(fs.readFileSync('data/greetings.json'));
```

5. Create an async function called `batchImport`.
6. For now, let's put in a console.log of the `greetings` variable.
7. Don't forget to call the function at the bottom of the file.
8. In the terminal, in VS Code, run the file with `node`. This will print the contents of `greetings.json` in the terminal.

```bash
node batchImport.js
```

8.  Add in all of the Mongo stuff! Look back at the other files and copy/paste over the code required for us to connect to the database.

    - Our function will be almost identical to the `createGreeting` function.
    - _You won't need any of the `req` and `res` stuff. Replace thos with console.logs._
    - Instead of using `insertOne`, you will use `insertMany`. You will need to change the `assert` a little as well...
    - `insertMany` accepts an array.

9.  If you got the success message you wrote, you should be good and it should have added all of the data to the database. In `2.3`, we'll confirm this.

## Exercise 2.3 - `findOne()` a greeting

Time to read the data!

1. Create a new `async` function called `getGreeting` in the `exercise-2.js` file.
2. Add a `res` in there for testing purposes.

```js
const getGreeting = async (req, res) => {
  res.status(200).json('bacon');
};
```

3. In `server.js`, create a new `get` endpoint that will accept a `url param` called `id`.
4. Require the function you just wrote.

```js
.get('ex-2/greeting/:_id', getGreeting)
```

5. Use Insomnia to test the endpoint. You should get a 'bacon' response...
6. Declare a variable `_id` to hold `req.param._id`.
7. Use the `.findOne` method to retrieve ONE element, based on its `_id`, from the database. `.findOne` takes a callback that will handle to handle the result.

_If the element doesn't exist, it will NOT return an error. It will return `null`. So we can add a condition to return the result only if it exists, if not return an error message._

```js
db.collection('two').findOne({ _id }, (err, result) => {
  result
    ? res.status(200).json({ status: 200, _id, data: result })
    : res.status(404).json({ status: 404, _id, data: 'Not Found' });
  client.close();
});
```

---

## Exercise 2.4 - `find()` more than one greeting

1. Create a new async function in `exercise-2.js`.
2. Declare the `client`
3. Connect to the client, etc.
4. Declare the `db`. _We're still using 'exercises'._
5. Use `.find()` to get back _all_ of the documents in the 'two' collection.
6. Use the `.toArray()`.
7. Be sure to `res`pond appropriately. `find` will return an empty array if it doesn't find anything...
8. Create a new endpoint: `.get('/ex-2/greeting', getGreetings)`
9. Call this enpoint from Insomnia. It should return _all_ of the documents in the collection.

Using `.find()` without passing anything to it will return _all_ of the documents in the collection.

It really isn't good practice to return _all_ of the data. What would happen if there were thousands of documents in the collection? 💥

10. Instead let's setup some limits. If a user makes a query like we did just above, they will get only the first 25 documents.

    - Use [`.slice()`](https://www.w3schools.com/jsref/jsref_slice_array.asp).
    - We will also need to remove the ternary operator and use a proper `if/else` statement.

11. This is better, but we need to allow user to be able to access all of the data.
12. If a user were to query our server with this `/ex-2/greeting?start=10&limit=10`, they would receive the 10th to the 20th values. Make this possible in your function.
    - There should also be fallback values if they only provide ony one of the query params, even none...
13. Finally, if the user requests a range that doesn't exist, is incomplete, we need to handle that. For example, if there are 100 documents, but they ask for `start=90&limit=20`, they should only receive the last 10 and nothing else.

### Stretch goal

Once you've implemented all of 2.4, everything works, but the user might not know if their query was good or not. We could provide them with some additional data in the response to let them know what the received in regards to the data.

For example, if there are only 12 values, but the query is `start=10&limit=5`. We should let the user know that we changed his/her query.

```js
{
  "status": 200,
  "start": 10,
  "limit": 2,
  "data": [
    {
      "_id": "HI",
      "lang": "Hindi",
      "hello": "Namaste"
    },
    {
      "_id": "HU",
      "lang": "Hungarian"
    }
  ]
}
```
