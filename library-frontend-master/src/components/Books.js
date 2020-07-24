import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_ALL_BOOKS } from '../queries'

const Books = (props) => {

  const results = useQuery(GET_ALL_BOOKS)


  if(results.loading){
    return "Loading..."
  }

  if (!props.show) {
    return null
  }

  const books = results.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books