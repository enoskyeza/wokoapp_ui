import ProgramDashboardScreen from '@/components/ProgramDashboard/ProgramDashboardScreen'

interface ProgramDashboardPageProps {
  params: Promise<{
    programId: string
  }>
}

export default async function ProgramDashboardPage({ params }: ProgramDashboardPageProps) {
  const { programId } = await params
  return <ProgramDashboardScreen programId={programId} />
}
