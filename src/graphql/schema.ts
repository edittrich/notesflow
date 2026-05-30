export const typeDefs = `
  type Note {
    id: ID!
    userId: ID!
    title: String!
    description: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getNotes(sortBy: String): [Note!]!
  }

  type Mutation {
    createNote(title: String!, description: String!): Note!
    updateNote(id: ID!, title: String, description: String): Note!
    deleteNote(id: ID!): Note!
  }
`;
