import express from 'express'

const app = express()
const port = process.env.port || 3000


app.get('/', (req, res) => {
  console.log(req)
  res.send('render server side stuff?');
});


app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
