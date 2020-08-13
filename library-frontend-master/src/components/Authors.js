
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_ALL_AUTHORS, UPDATE_AUTHOR } from "../queries"

const Authors = (props) => {
  const result = useQuery(GET_ALL_AUTHORS)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [updateAuthorsAge] = useMutation(UPDATE_AUTHOR)


  useEffect(() => {
    if (!result.data) return
    setSelectedAuthor(result.data.allAuthors[0]?.name)
  }, [result])

  if (result.loading) {
    return "Loading..."
  }

  if (result.error) {
    return result.error.toString()
  }

  if (!props.show) {
    return null
  }
  const authors = result.data.allAuthors



  const handleUpdate = () => {
    updateAuthorsAge({ variables: { name: selectedAuthor, bornYear: parseInt(selectedYear) } })
  }

  const handleAuthorSelect = (event) => {
    setSelectedAuthor(event.target.value)
  }


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <select value={selectedAuthor} onChange={handleAuthorSelect}>
        {authors.map(({ name }) => <option key={name} value={name}>{name}</option>)}
      </select>
      <input value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}></input>
      <button disabled={!props.loggedIn} onClick={handleUpdate}>Save changes</button>

    </div>
  )
}

export default Authors
