import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Box, Toolbar } from '@mui/material';
import TopBar from '@/shared/components/TopBar';
import Sidebar from '@/shared/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
