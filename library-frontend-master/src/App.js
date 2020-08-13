
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from "./components/LoginForm"
import Notify from "./components/Notify"
import Recommend from "./components/Recommend"
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider, useQuery } from '@apollo/client'
import { setContext } from '@apollo/link-context'
import { GET_CURRENT_USER } from "./queries"

import { client } from "./index"




const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

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
          {loggedIn && <button onClick={() => setPage("recommend")}>recommend</button>}
          {!loggedIn && <button onClick={() => setPage('login')}>login</button>}
          {loggedIn && <button onClick={logout}>log out</button>}

        </div>

        <Authors
          show={page === 'authors'}
          loggedIn={loggedIn}
        />

        <Books
          show={page === 'books'}
        />

        <NewBook
          show={page === 'add'}
        />

        <Recommend show={page === "recommend"} currentUser={currentUser} />

        <LoginForm
          show={page === "login"}
          errorMessage={errorMessage}
          token={token}
          setToken={setToken}
          setPage={setPage}
        />

      </div>
    </ApolloProvider>
  )
}

export default App