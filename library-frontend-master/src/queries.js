import { gql } from "@apollo/client"

export const GET_ALL_AUTHORS = gql`
query {
  allAuthors  {
    name,
    born,
    bookCount,
    id
  }
}
`

export const GET_ALL_BOOKS = gql`
query {
    allBooks {
        title
        published
        author
        id
    }
}
`

export const ADD_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres,
  ) {title,published,author,id,genres}
}
`
export const UPDATE_AUTHOR = gql`
mutation editAuthor($name: String!, $bornYear: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $bornYear,
  ) {name,born,id}
}
`