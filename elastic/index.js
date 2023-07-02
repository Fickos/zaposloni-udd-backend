const logger = require('../logger');
const config = require('../config');

const elasticsearch = require('elasticsearch');

const elasticClient = new elasticsearch.Client({
  host: config.ELASTIC_URI,
  sniffOnStart: false
});

module.exports.elasticClient = elasticClient;

module.exports.indexDocument = async function (indexName, _id, fileName, uploaderInfo) {
    const response = await elasticClient.index({
      index: indexName,
      id: _id,
      body: {
        ...uploaderInfo,
        fileName: fileName,
      },
    });
    logger.info(`Document indexed in ${indexName}`);
    logger.info(response);
    // console.log(`Document indexed in ${indexName}: ${response.body.result}`);
}

module.exports.search = async function (indexName, searchBody) {
    const response = await elasticClient.search({
      // Consider removing this index
      index: indexName,
      body: { ...searchBody, 
        highlight: {
          fields: {
            cvContent: { fragment_size: 50, number_of_fragments: 3 },
            coverLetterContent: { fragment_size: 50, number_of_fragments: 1},
          },
      },}
    });
    logger.info(`Search completed`);
    return response;
}
  