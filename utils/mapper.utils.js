module.exports.mapClientQueryToElasticsearchQuery = function (query) {
    const boolQuery = {
      query: {
        bool: {
          must: query.must.map(condition => ({ match: { content: condition.content } })),
          should: query.should.map(condition => ({ match: { content: condition.content } })),
          must_not: query.mustNot.map(condition => ({ match: { content: condition.content } }))
        }
      }
    };
  
    return boolQuery;
}