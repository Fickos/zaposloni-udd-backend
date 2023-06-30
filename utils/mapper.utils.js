const logger = require("../logger");

function mapClientQueryToElasticsearchQuery (query) {
  const { combinator, rules } = query;
  const boolQuery = {
    bool: {
      should: [],
      must: [],
      must_not: []
    }
  };

  rules.forEach(rule => {
    const { id, field, operator, valueSource, value, rules } = rule;
    const condition = {
      match: {
        [field]: value
      }
    };

    if (operator === "=" && valueSource === "value") {
      if (combinator === "and") {
        boolQuery.bool.must.push(condition);
      } else {
        boolQuery.bool.should.push(condition);
      }
    } else if (operator === "=" && valueSource === "field") {
      const fieldCondition = {
        match: {
          [field]: {
            query: value,
            operator: "and"
          }
        }
      };
      if (combinator === "and") {
        boolQuery.bool.must.push(fieldCondition);
      } else {
        boolQuery.bool.should.push(fieldCondition);
      }
    } else if (operator === "!=" && valueSource === "value") {
      const mustNotCondition = {
        match: {
          [field]: value
        }
      };
      boolQuery.bool.must_not.push(mustNotCondition);
    }

    if (rules) {
      const nestedQuery = mapClientQueryToElasticsearchQuery({ combinator, rules });
      if (nestedQuery) {
        const nestedCondition = {
          bool: {
            should: [nestedQuery]
          }
        };

        if (combinator === "and") {
          boolQuery.bool.must.push(nestedCondition);
        } else {
          boolQuery.bool.should.push(nestedCondition);
        }
      }
    }
  });
  logger.debug('BODY FOR ELASTIC SEARCH BOOLEAN QUERY', boolQuery);
  return boolQuery;
}

module.exports.mapClientQueryToElasticsearchQuery = mapClientQueryToElasticsearchQuery;
