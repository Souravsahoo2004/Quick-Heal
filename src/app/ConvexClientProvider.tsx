"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ReactNode, useState } from "react"

const url = process.env.NEXT_PUBLIC_CONVEX_URL!

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode
}) {
  const [client] = useState(() => new ConvexReactClient(url))

  return (
    <ConvexProvider client={client}>
      {children}
    </ConvexProvider>
  )
}