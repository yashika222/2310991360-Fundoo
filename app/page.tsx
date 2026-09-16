import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <h1>FundooNotes API</h1>
      <p>
        <Link href="/api-docs">Open Swagger</Link>
        {' · '}
        <Link href="/api/health">Health</Link>
      </p>
    </main>
  );
}
