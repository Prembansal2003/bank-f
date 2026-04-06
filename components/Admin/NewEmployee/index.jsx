import Adminlayout from '../../Layout/Adminlayout';
import { Input, Form, Card, Button, Table, message, Image, Popconfirm, Select, Spin } from 'antd'; // Added Spin
import { EyeInvisibleOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { trim, http, fetchData, uploadFile } from '../../../modules/modules';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Cookies from 'universal-cookie';

const { Item } = Form;

const NewEmployee = () => {
    const cookie = new Cookies();
    const token = cookie.get("authToken");
    const [empForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false); 
    const [photo, setPhoto] = useState(null);
    const [employee, setEmployee] = useState([]);
    const [finalEmployee, setFinalEmployee] = useState([]);
    const [allBranch, setAllBranch] = useState([]);
    const [messageApi, context] = message.useMessage();
    const [no, setNo] = useState(0);
    const [edit, setEdit] = useState(null);

    const { data: branches, error: bError } = useSWR(
        "/api/branch",
        fetchData,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 120000
        }
    );

    useEffect(() => {
        if (branches) {
            let filter = branches && branches?.data.map(item => ({
                label: item.branchName,
                value: item.branchName,
                key: item.key
            }))
            setAllBranch(filter);
        }
    }, [branches]);

    useEffect(() => {
        const fetcher = async () => {
            const httpreq = http(token);
            try {
                const { data } = await httpreq.get("/api/users");
                setEmployee(data?.data.filter((item) => item.userType != "customer"));
                setFinalEmployee(data?.data.filter((item) => item.userType != "customer"));
            }
            catch (error) {
                messageApi.error("unable to fetch")
            }
        };
        fetcher();
    }, [no]);

    const fileupload = async (e) => {
        let file = e.target.files[0];
        if (!file) return; 

        const folderName = "employeePhoto";
        setImgLoading(true); 
        try {
            const result = await uploadFile(file, folderName);
            let imageUrl = result.filePath;
            if (imageUrl && imageUrl.startsWith("http:")) {
                imageUrl = imageUrl.replace("http:", "https:");
            }
            if (imageUrl && imageUrl.includes("https:/") && !imageUrl.includes("https://")) {
                imageUrl = imageUrl.replace("https:/", "https://");
            }
            setPhoto(imageUrl);
            messageApi.success("Image uploaded successfully");
        }
        catch {
            messageApi.error("Upload Failed");
        }
        finally {
            setImgLoading(false); 
        }
    }

    const onUpdate = async (id, active) => {
        try {
            const data = {
                isActive: !active
            };
            const httpreq = http(token);
            await httpreq.put(`/api/users/${id}`, data);
            setNo(no + 1);
        }
        catch (error) {
            messageApi.error("Update fail");
        }
    }

    const onDelete = async (id) => {
        try {
            const httpreq = http(token);
            const { data } = await httpreq.delete(`/api/users/${id}`);
            messageApi.success("Employee deleted successfully");
            setNo(no + 1);
        }
        catch (error) {
            messageApi.error("Deletion Failed");
        }
    }

    const onEdit = async (obj) => {
        setEdit(obj);
        const copy = { ...obj };
        setPhoto(obj.profile); 
        empForm.setFieldsValue(copy);
    };

    const updateData = async (values) => {
        try {
            setLoading(true);
            const finobj = trim(values);
            delete finobj.password;

            if (photo) {
                finobj.profile = photo;
            }
            const httpreq = http(token);
            await httpreq.put(`/api/users/${edit._id}`, finobj);
            messageApi.success("updated successfully");
            setEdit(null);
            setPhoto(null); 
            setNo(no + 1);
            empForm.resetFields();
        }
        catch (error) {
            messageApi.error("Edit unsuccessful");
        }
        finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            let finobj = trim(values);
            finobj.profile = photo ? photo : "https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif";
            finobj.key = finobj.email;
            finobj.userType = "employee";
            const httpreq = http(token);
            await httpreq.post("/api/email", finobj);
            await httpreq.post("/api/users", finobj);
            empForm.resetFields();
            setPhoto(null); 
            messageApi.success("Employee created");
            setNo(no + 1);
        }
        catch (error) {
            const backendMsg = error.response?.data?.message || '';
            const field = error.response?.data?.field || '';
            if (error.response?.data?.error?.code == 11000 || backendMsg.includes('already exists')) {
                empForm.setFields([{
                    name: field || 'email',
                    errors: [backendMsg || 'Email already exists']
                }]);
            }
            else if (field) {
                empForm.setFields([{ name: field, errors: [backendMsg] }]);
            }
            else {
                messageApi.error(backendMsg || "Try Again");
            }
        }
        finally {
            setLoading(false);
        }

    };

    const onSearch = (e) => {
        let value = e.target.value.trim().toLowerCase();
        let filter = finalEmployee && finalEmployee.filter(emp => {
            if (emp.fullName.toLowerCase().indexOf(value) != -1) {
                return emp;
            }
            else if (emp.userType.toLowerCase().indexOf(value) != -1) {
                return emp;
            }
            else if (emp.email.toLowerCase().indexOf(value) != -1) {
                return emp;
            }
            else if (emp.branch.toLowerCase().indexOf(value) != -1) {
                return emp;
            }
        })
        setEmployee(filter);
    }

    const columns = [{
        title: 'Profile',
        key: 'profile',
        render: (src, obj) => {
            return (
                <Image
                    src={obj.profile}
                    className="rounded-full"
                    height={40}
                    width={40}
                />
            )
        }
    },
    {
        title: 'User type',
        dataIndex: 'userType',
        key: 'userType',
        render: (text) => {
            if (text == "admin") {
                return <span className='capitalize text-indigo-500'>
                    {text}
                </span>
            }
            else if (text == "employee") {
                return <span className='capitalize text-green-500'>
                    {text}
                </span>
            }
            else {
                return <span className='capitalize text-red-500'>
                    {text}
                </span>
            }
        }

    },
    {
        title: 'Branch',
        dataIndex: 'branch',
        key: 'branch'
    },
    {
        title: 'FullName',
        dataIndex: 'fullName',
        key: 'fullName'
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email'
    },
    {
        title: 'Mobile',
        dataIndex: 'mobile',
        key: 'mobile'
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address'
    },
    {
        title: 'Action',
        key: 'action',
        fixed: "right",
        render: (_, obj) => (
            <div className='flex gap-x-1'>
                <Popconfirm title="Change Active" description="Do you want to toggle active" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onUpdate(obj._id, obj.isActive) }}>
                    <Button type='text' className={`${obj.isActive ? "!text-indigo-700 !bg-indigo-400" : "!text-pink-700 !bg-pink-400"}`} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
                </Popconfirm>
                <Popconfirm title="Edit Data" description="Do you want to edit data" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onEdit(obj) }}>
                    <Button type='text' className='!text-green-700 !bg-green-400' icon={<EditOutlined />} />
                </Popconfirm>
                <Popconfirm title="Delete Data" description="Do you want to delete data" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onDelete(obj._id) }}>
                    <Button type='text' className='!text-rose-700 !bg-rose-400' icon={<DeleteOutlined />} />
                </Popconfirm>

            </div>)
    }
    ];
    return (
        <Adminlayout >
            {context}
            <div className='grid md:grid-cols-3 gap-2'>
                <Card title='Add new employee'>
                    <Form layout='vertical' name='employee' onFinish={edit ? updateData : onFinish} form={empForm}>
                        <Item
                            name="branch"
                            label="Select Branch"
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder="Select Branch"
                                options={allBranch}
                            />
                        </Item>
                        <Item label='Profile'>
                            <div className="flex flex-col gap-2">
                                <input 
                                    type='file' 
                                    className="ant-input p-1" 
                                    onChange={fileupload} 
                                    accept="image/*"
                                />
                                {imgLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                                {photo && !imgLoading && (
                                    <div className="mt-2">
                                        <Image src={photo} width={60} />
                                    </div>
                                )}
                            </div>
                        </Item>
                        <div className='grid grid-cols-2 gap-2'>
                            <Item label='FullName' name='fullName' rules={[
                                { required: true, message: 'Full name is required' },
                                { min: 3, message: 'Name must be at least 3 characters' }
                            ]}>
                                <Input />
                            </Item>
                            <Item label='Mobile' name='mobile' rules={[
                                { required: true, message: 'Mobile number is required' },
                                { pattern: /^\d{10}$/, message: 'Mobile must be exactly 10 digits' }
                            ]}>
                                <Input type='number' maxLength={10} />
                            </Item>
                            <Item label='Email' name='email' rules={[
                                { required: true, message: 'Email is required' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}>
                                <Input disabled={edit ? true : false} />
                            </Item>
                            <Item label='Password' name='password' rules={[
                                { required: edit ? false : true, message: 'Password is required' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}>
                                <Input disabled={edit ? true : false} />
                            </Item>
                        </div>
                        <Item label='Address' name='address' rules={[
                            { required: true, message: 'Address is required' }
                        ]}>
                            <Input.TextArea />
                        </Item>
                        <Item>
                            {edit ? <Button loading={loading} type='text' htmlType='submit' block className='!bg-red-500 !text-white !font-bold'>Update</Button>
                                :
                                <Button loading={loading} type='text' htmlType='submit' block className='!bg-blue-500 !text-white !font-bold'>Add Employee</Button>
                            }
                        </Item>
                    </Form>
                </Card>
                <Card className='col-span-2' title='Employee list' style={{ overflowX: "auto" }} extra={<div>
                    <Input placeholder='Search by all'
                        prefix={<SearchOutlined />}
                        onChange={onSearch}
                    />
                </div>
                } >
                    <Table columns={columns} dataSource={employee} scroll={{ x: "max-content" }} />
                </Card>
            </div>
        </Adminlayout>
    )
};
export default NewEmployee;
