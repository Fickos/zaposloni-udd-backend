const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('./logger');

const app = express();
app.use(express.json());

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}

app.use(cors(corsOptions));

const routes = require('./routes');
app.use('', routes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.message);
  logger.error(err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

const { elasticClient } = require('./elastic');

elasticClient.ping({
  requestTimeout: 3000
}, function (error) {
if (error) {
  console.trace('elasticsearch cluster is down!');
} else {
  console.log('Elastic search is running.');
}
});

console.log(elasticClient.indices);

elasticClient.indices.exists({
  index: 'cv_with_geo'
}).then(function (resp) {
    if (resp) {
      logger.info('Index exists');
    } else {
      elasticClient.indices.create({
        index: 'cv_with_geo',
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              surname: { type: 'text' },
              education: { type: 'text' },
              address: { type: 'text' },
              content: { type: 'text' },
              fileName: { type: 'text'},
              coverLetterContent: { type: 'text' },
              location: { type: 'geo_point' }
            },
          },
        },
        requestTimeout: 300000
      }).then(function (resp) {
         logger.info("New index created");
      }, function (err) {
         logger.error('Error while creating an index');
         logger.error(err.message);
      });
    }
}, function (err) {
  logger.error('Error while checking whether index exists');
  logger.error(err.message);
})

app.listen(config.PORT, logger.info(`Listening on port: ${config.PORT}`));
