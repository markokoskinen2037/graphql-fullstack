import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Notify from './components/Notify'
import Recommend from './components/Recommend'
import { ApolloProvider, useQuery, gql, useSubscription } from '@apollo/client'
import { GET_CURRENT_USER, GET_ALL_BOOKS } from './queries'

import { client } from './index'

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published
    genres
    author {
      id
      name
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
`

export const updateCacheWith = (addedBook) => {
  const includedIn = (set, object) => set.map((p) => p.id).includes(object.id)

  const dataInStore = client.readQuery({ query: GET_ALL_BOOKS })
  if (!includedIn(dataInStore.allBooks, addedBook)) {
    client.writeQuery({
      query: GET_ALL_BOOKS,
      data: { allBooks: dataInStore.allBooks.concat(addedBook) },
    })
  }
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      alert(`New book ${addedBook.title}`)
      updateCacheWith(addedBook)
    },
  })

  const currentUserResult = useQuery(GET_CURRENT_USER)
  const currentUser = currentUserResult?.data?.me

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const loggedIn = !!localStorage.getItem('phonenumbers-user-token')

  return (
    <ApolloProvider client={client}>
      <div>
        <Notify errorMessage={errorMessage} />
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          {loggedIn && <button onClick={() => setPage('add')}>add book</button>}
          {loggedIn && <button onClick={() => setPage('recommend')}>recommend</button>}
          {!loggedIn && <button onClick={() => setPage('login')}>login</button>}
          {loggedIn && <button onClick={logout}>log out</button>}
        </div>

        <Authors show={page === 'authors'} loggedIn={loggedIn} />

        <Books show={page === 'books'} />

        <NewBook show={page === 'add'} />

        <Recommend show={page === 'recommend'} currentUser={currentUser} />

        <LoginForm show={page === 'login'} errorMessage={errorMessage} token={token} setToken={setToken} setPage={setPage} setError={setErrorMessage} />
      </div>
    </ApolloProvider>
  )
}

export default App
