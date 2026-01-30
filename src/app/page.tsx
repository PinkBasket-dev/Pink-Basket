import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Pink Basket</h1>
      <p>Welcome to the shop front.</p>
      <p>
        Go to{' '}
        <Link href="/shop">
          /shop
        </Link>
      </p>
    </main>
  )
}
