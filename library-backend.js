require('dotenv').config()

const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Author = require('./schemas/Author')
const Book = require('./schemas/Book')
const User = require('./schemas/User')
mongoose.set('useFindAndModify', false)

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.DB_URI

if (!process.env.DB_URI) throw new Error('DB_URI must be set')

const pubsub = new PubSub()

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Subscription {
    bookAdded: Book!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favouriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]!
    allBooks(author: String, genre: String): [Book!]
    me: User
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const { author, genre } = args

      const books = await Book.find({}).populate('author')
      let res = books

      if (genre) res = res.filter((b) => b.genres.includes(genre))
      if (author) res = res.filter((b) => b.author.name === author)

      return res
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')

      const res = authors.map((a) => ({
        name: a.name,
        id: a._id,
        bookCount: books.reduce((pre, cur) => {
          if (cur.author.name === a.name) return ++pre
          return pre
        }, 0),
      }))

      return res
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const { title, author, published, genres } = args

      let acualAuthor = await Author.findOne({ name: author }).exec()
      if (!acualAuthor) {
        acualAuthor = await Author.create({ name: author })
      }

      try {
        const newBook = await Book.create({
          title,
          published,
          genres,
          author: acualAuthor._id,
        })

        await newBook.populate('author').execPopulate()

        pubsub.publish('BOOK_ADDED', { bookAdded: newBook })

        return newBook
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const { name, setBornTo } = args
      const targetAuthor = await Author.findOne({ name })

      if (!targetAuthor) return null

      targetAuthor.born = parseInt(setBornTo)
      await targetAuthor.save()

      return targetAuthor
    },
    createUser: (root, args) => {
      const { username, favouriteGenre } = args
      const user = new User({ username, favouriteGenre })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'sekred') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
