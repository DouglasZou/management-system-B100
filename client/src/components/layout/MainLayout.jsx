import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Spa as SpaIcon,
  Settings as SettingsIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { getCurrentUser, logout } from '../../services/api';

const drawerWidth = 250;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = getCurrentUser();
  
  const isAdmin = user?.role === 'admin';
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Schedule 日程', icon: <EventIcon />, path: '/schedule' },
    { text: 'Dashboard 后台', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Clients 客户', icon: <PeopleIcon />, path: '/clients' },
    { text: 'Staff 员工', icon: <PersonIcon />, path: '/staff', adminOnly: true },
    { text: 'Services 服务', icon: <SpaIcon />, path: '/services', adminOnly: true },
    { text: 'Settings 设置', icon: <SettingsIcon />, path: '/settings', adminOnly: true },
  ];
  
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (user && user.role === 'admin')
  );
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          综合日程管理系统
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                bgcolor: isActive ? 'rgba(126, 101, 67, 0.12)' : 'transparent',
                borderLeft: isActive ? '4px solid #7e6543' : '4px solid transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(126, 101, 67, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#7e6543' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive ? '#7e6543' : 'inherit'
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: drawerWidth },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BEAUTY 100 SERANGOON
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName} ({user?.role})
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: drawerWidth, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              transition: 'width 0.2s ease-in-out' // Smooth transition when resizing
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 