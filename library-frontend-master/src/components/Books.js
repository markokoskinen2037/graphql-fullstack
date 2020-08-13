import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [getBooks, results] = useLazyQuery(GET_ALL_BOOKS)
  const [selectedGenre, setSelectedGenre] = useState()

  useEffect(() => {
    getBooks({ variables: { genre: selectedGenre } })
  }, [selectedGenre, getBooks])

  if (results.loading) {
    return 'Loading...'
  }

  if (!props.show || !results.data) {
    return null
  }

  const uniqueGenres = results.data.allBooks.reduce((acc, { genres }) => {
    genres.forEach((g) => {
      if (!acc.includes(g)) acc.push(g)
    })
    return acc
  }, [])

  const books = results.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {uniqueGenres.map((g) => (
          <button key={g} onClick={() => setSelectedGenre(g)}>
            {g}
          </button>
        ))}
        {selectedGenre && <button onClick={() => setSelectedGenre(null)}>x</button>}
      </div>
    </div>
  )
}

export default Books
