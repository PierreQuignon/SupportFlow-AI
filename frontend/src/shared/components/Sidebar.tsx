'use client';

import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DRAWER_WIDTH = 220;

const navItems = [
  { label: 'Inbox', href: '/inbox', icon: < EmailIcon/> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {navItems.map(({ label, href, icon }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={pathname.startsWith(href)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
