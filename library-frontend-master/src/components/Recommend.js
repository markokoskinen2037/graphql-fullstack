import React, { useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_ALL_BOOKS } from '../queries'

export default function Recommend({ show, currentUser }) {
  const [getRecommendations, result] = useLazyQuery(GET_ALL_BOOKS)

  useEffect(() => {
    if (currentUser?.favouriteGenre) getRecommendations({ variables: { genre: currentUser.favouriteGenre } })
  }, [currentUser, getRecommendations])

  if (!show || !currentUser) return null
  const { favouriteGenre } = currentUser

  return (
    <div>
      <p>{`Showing ${favouriteGenre} recommendations:`}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
