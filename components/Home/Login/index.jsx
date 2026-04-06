import { Button, Card, Form, Input, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { http, trim } from '../../../modules/modules';
import Cookies from "universal-cookie";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
const { Item } = Form;
const Login = () => {
    const navigate = useNavigate();
    const cookie = new Cookies();
    const expires = new Date();
    expires.setDate(expires.getDate() + 3);
    const [messageApi, context] = message.useMessage();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const finobj = trim(values);
            const httpreq = http();
            const { data } = await httpreq.post("/api/login", finobj);
            if (data?.isLogged && data?.userType == "admin") {
                const { token } = data;
                cookie.set("authToken", token, { path: "/", expires });
                messageApi.success("Login successful");
                navigate("/admin");
            }
            else if (data?.isLogged && data?.userType == "employee") {
                const { token } = data;
                cookie.set("authToken", token, { path: "/", expires });
                messageApi.success("Login successful");
                navigate("/employee");
            }
            else if (data?.isLogged && data?.userType == "customer") {
                const { token } = data;
                cookie.set("authToken", token, { path: "/", expires });
                messageApi.success("Login successful");
                navigate("/customer");
            }
            else {
                messageApi.error("Wrong Credentials");
            }
        }
        catch (err) {
            messageApi.error(err?.response?.data?.message || "Login failed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <div className='flex'>
            {context}
            <div className="w-1/2 hidden md:flex items-center justify-center">
                <img src='/bank-img.jpg' alt='bank' className='w-4/5 object contain' />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center">
                <Card className='w-full max-w-md shadow-xl'>
                    <h1 className='text-2xl font-semibold text-center '>
                        Bank Login
                    </h1>
                    <Form name='login' onFinish={onFinish} layout='vertical'>
                        <Item label='username' name='email' rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}>
                            <Input prefix={<UserOutlined />} placeholder='enter your username' />
                        </Item>
                        <Item label='password' name='password' rules={[
                            { required: true, message: 'Password is required' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}>
                            <Input.Password prefix={<LockOutlined />} placeholder='enter your password' />
                        </Item>
                        <Item>
                            <Button
                                type='text'
                                htmlType='submit'
                                block
                                loading={loading}
                                disabled={loading}
                                className='!bg-blue-500 !text-white !font-bold'
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </Item>
                    </Form>
                </Card>
            </div>
        </div>
    )
};
export default Login;
