const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} = require('graphql')

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'hi'
      }
    }
  })
})

module.exports.execute = (query) => graphql(schema, query)
