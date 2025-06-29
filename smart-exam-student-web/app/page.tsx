"use client"

import dynamic from "next/dynamic"

// ⬇️  Load the SPA only in the browser
const ClientApp = dynamic(() => import("../src/App"), {
  ssr: false, // ⛔️ skip server-side rendering to avoid `document` errors
})

export default function Page() {
  return <ClientApp />
}
