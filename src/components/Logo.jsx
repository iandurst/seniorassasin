
import React from 'react'

export default function Logo({ size = 28 }) {
  return (
    <img src="/logo.svg" width={size} height={size} alt="PCS Senior Assassin logo" className="rounded-md" />
  )
}
