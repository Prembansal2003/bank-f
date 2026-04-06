import React, { useState } from 'react';
import {Link ,useLocation, useNavigate} from 'react-router-dom'
import {
  AccountBookOutlined,
  BranchesOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import Cookies from "universal-cookie"; 
import { Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;
const Customerlayout= ({children}) => {
    const navigate=useNavigate();
    const {pathname}=useLocation();
    const cookie=new Cookies();
    const logoutFunc=()=>{
      cookie.remove("authToken");
      sessionStorage.removeItem("userInfo");
      navigate("/");
    }
    const items=[
            {
              key: '/customer',
              icon: <DashboardOutlined />,
              label: <Link to='/customer'>Dashboard</Link>,
            },
            {
              key: '/customer/transaction',
              icon: <BranchesOutlined/>,
              label: <Link to='/customer/transaction'>Transactions</Link>,
            },
            {
              key: '/customer/logout',
              icon: <LogoutOutlined />,
              label: <Button type="text" className='!text-gray-300 !font-semibold' onClick={logoutFunc}>Logout</Button>
            }
        ];
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          items={items}
        />
      </Sider>
      <Layout className='!min-h-screen'>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
export default Customerlayout;