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
query ($genre:String) {
    allBooks(genre:$genre) {
        title
        published
        author {name,id,born}
        id
        genres
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
  ) {title,published,author {name,id,born},id,genres}
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

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
export const GET_CURRENT_USER = gql`
query{
  me
  {username,favouriteGenre,id}
}
`