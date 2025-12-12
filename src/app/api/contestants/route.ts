// app/api/contestants/route.ts
// Updated to use new Participant and Registration endpoints

import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://kyeza.pythonanywhere.com'
  : 'http://127.0.0.1:8000';

// Correct endpoints (plural forms)
const PARTICIPANT_URL = `${API_BASE_URL}/register/participants/`;
const REGISTRATION_URL = `${API_BASE_URL}/register/registrations/`;

interface ParticipantData {
  id: number;
  first_name: string;
  last_name: string;
  identifier: string;
  [key: string]: unknown;
}

interface RegistrationData {
  id: number;
  participant: number;
  payment_status: string;
  program: number;
  category_value: string;
  [key: string]: unknown;
}

export async function GET() {
  console.log('🔵 API Route: Fetching contestants data...');
  console.log('📍 Participant URL:', PARTICIPANT_URL);
  console.log('📍 Registration URL:', REGISTRATION_URL);
  
  try {
    // Fetch participants and registrations using NEW endpoints
    const [participantResponse, registrationResponse] = await Promise.all([
      fetch(PARTICIPANT_URL),
      fetch(REGISTRATION_URL),
    ]);

    console.log('📊 Participant Response Status:', participantResponse.status);
    console.log('📊 Registration Response Status:', registrationResponse.status);

    // Check if both fetch requests were successful
    if (!participantResponse.ok || !registrationResponse.ok) {
      console.error('❌ Fetch failed:', {
        participantStatus: participantResponse.status,
        registrationStatus: registrationResponse.status
      });
      throw new Error('Failed to fetch data from one or both endpoints');
    }

    // Parse the JSON data
    const participantsJson = await participantResponse.json();
    const registrationsJson = await registrationResponse.json();
    
    // Handle paginated responses (Django REST framework pagination)
    const participants = (participantsJson.results || participantsJson) as ParticipantData[];
    const registrations = (registrationsJson.results || registrationsJson) as RegistrationData[];
    
    console.log('✅ Participants fetched:', participants.length);
    console.log('✅ Registrations fetched:', registrations.length);
    console.log('🔍 Participants type:', Array.isArray(participants));
    console.log('🔍 Registrations type:', Array.isArray(registrations));

    // Transform to match old format for backward compatibility
    // Map registrations to add payment/program info to participants
    const enrichedParticipants = participants.map((participant: ParticipantData) => {
      const registration = registrations.find((reg: RegistrationData) => reg.participant === participant.id);
      return {
        ...participant,
        payment_status: registration?.payment_status || 'unpaid',
        program: registration?.program,
        category_value: registration?.category_value,
        registration_id: registration?.id,
      };
    });

    // Return structured data (keeping 'contestants' key for backward compatibility)
    return NextResponse.json({ 
      contestants: enrichedParticipants,
      participants: enrichedParticipants,
      registrations: registrations,
      parents: [] // Empty array since Parent model was deleted
    });
  } catch (error) {
    console.error('❌ ERROR in contestants API route:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error',
      urls: { PARTICIPANT_URL, REGISTRATION_URL }
    }, { status: 500 });
  }
}
