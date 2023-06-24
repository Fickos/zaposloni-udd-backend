const logger = require('../logger');
const config = require('../config');

const elasticsearch = require('elasticsearch');

const elasticClient = new elasticsearch.Client({
  host: config.ELASTIC_URI,
  sniffOnStart: false
});

module.exports.elasticClient = elasticClient;

module.exports.indexDocument = async function (indexName, fileData, fileName) {
    const response = await elasticClient.index({
      index: indexName,
      body: {
        file: fileData, // Base64-encoded string or buffer containing the file data
        fileName: fileName,
      },
    });
    logger.info(`Document indexed in ${indexName}`);
    logger.info(response);
    // console.log(`Document indexed in ${indexName}: ${response.body.result}`);
}
  