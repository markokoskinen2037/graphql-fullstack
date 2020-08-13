import React from 'react'
export default function Notify({ errorMessage }) {
  return (
    <div style={{ color: "red" }}>{errorMessage}</div>
  )
}
