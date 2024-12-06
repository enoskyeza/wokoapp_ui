// app/api/contestants/route.ts

import { NextResponse } from 'next/server';

// const CONTESTANT_URL = process.env.NODE_ENV === 'production'
//   ? 'https://kyeza.pythonanywhere.com/register/contestants/'
//   : 'http://127.0.0.1:8000/register/contestants/';

// const PARENT_URL = process.env.NODE_ENV === 'production'
//   ? 'https://kyeza.pythonanywhere.com/register/parents/'
//   : 'http://127.0.0.1:8000/register/parents/';

const CONTESTANT_URL = 'https://kyeza.pythonanywhere.com/register/contestants/'
const PARENT_URL = 'https://kyeza.pythonanywhere.com/register/parents/'

export async function GET() {
  try {
    // Fetch contestants and parents data concurrently
    const [contestantResponse, parentResponse] = await Promise.all([
      fetch(CONTESTANT_URL),
      fetch(PARENT_URL),
    ]);

    // Check if both fetch requests were successful
    if (!contestantResponse.ok || !parentResponse.ok) {
      throw new Error('Failed to fetch data from one or both endpoints');
    }

    // Parse the JSON data
    const contestants = await contestantResponse.json();
    const parents = await parentResponse.json();

    // Return structured data
    return NextResponse.json({ contestants, parents });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
