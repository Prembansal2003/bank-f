import { Button, Card, DatePicker, Form, Image, Input, message, Modal, Popconfirm, Select, Table, Spin } from 'antd';
import Employeelayout from '../../Layout/Employeelayout'
import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { fetchData, formatDate, http, trim, uploadFile } from '../../../modules/modules';
import useSWR, { mutate } from 'swr';
import dayjs from 'dayjs'; 
import Cookies from 'universal-cookie'    
const { Item } = Form;

const NewAccount = () => {
        const cookie = new Cookies();
    const token = cookie.get('authToken');

    const [accountForm] = Form.useForm();
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
    const [accountModel, setAccountModel] = useState(false); 
    const [messageApi, context] = message.useMessage();
    const [loading, setLoading] = useState(false);
    
    const [photoLoading, setPhotoLoading] = useState(false);
    const [signatureLoading, setSignatureLoading] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);

    const [photo, setPhoto] = useState(null);
    const [signature, setSignature] = useState(null);
    const [document, setDocument] = useState(null);
    
    const [allCustomer, setAllCustomer] = useState(null);
    const [finalCustomer, setFinalCustomer] = useState(null);
    const [edit, setEdit] = useState(null);
    const [no, setNo] = useState(0);

    const onCloseModal = () => {
        setAccountModel(false);
        setEdit(null);
        setPhoto(null);
        setSignature(null);
        setDocument(null);
        accountForm.resetFields();
    }

    const onUpdate = async (id, active, loginid) => {
        try {
            const data = {
                isActive: !active
            };
            const httpreq = http(token);
            await httpreq.put(`/api/customers/${id}`, data);
            await httpreq.put(`/api/users/${loginid}`, data);
            setNo(no + 1);
        }
        catch (error) {
            messageApi.error("Update fail");
        }
    }

    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const folderName = "customerPhoto";
        setPhotoLoading(true);
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
            messageApi.success("Photo uploaded");
        }
        catch {
            messageApi.error("Upload Failed");
        } finally {
            setPhotoLoading(false);
        }
    }

    const handleSignature = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const folderName = "customerSignature";
        setSignatureLoading(true);
        try {
            const result = await uploadFile(file, folderName);
            let imageUrl = result.filePath;
            if (imageUrl && imageUrl.startsWith("http:")) {
                imageUrl = imageUrl.replace("http:", "https:");
            }
            if (imageUrl && imageUrl.includes("https:/") && !imageUrl.includes("https://")) {
                imageUrl = imageUrl.replace("https:/", "https://");
            }
            setSignature(imageUrl);
            messageApi.success("Signature uploaded");
        }
        catch {
            messageApi.error("Upload Failed");
        } finally {
            setSignatureLoading(false);
        }
    }

    const handleDocument = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const folderName = "customerDocument";
        setDocumentLoading(true);
        try {
            const result = await uploadFile(file, folderName);
            let imageUrl = result.filePath;
            if (imageUrl && imageUrl.startsWith("http:")) {
                imageUrl = imageUrl.replace("http:", "https:");
            }
            if (imageUrl && imageUrl.includes("https:/") && !imageUrl.includes("https://")) {
                imageUrl = imageUrl.replace("https:/", "https://");
            }
            setDocument(imageUrl);
            messageApi.success("Document uploaded");
        }
        catch {
            messageApi.error("Upload Failed");
        } finally {
            setDocumentLoading(false);
        }
    }

    const { data: brandings, error: bError } = useSWR("/api/branding", fetchData, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 1200000
    });

    useEffect(() => {
        const fetcher = async () => {
            const httpreq = http(token);
            try {
                const { data } = await httpreq.get("/api/customers");
                setAllCustomer(data?.data?.filter((item) => item.branch == userInfo.branch));
                setFinalCustomer(data?.data?.filter((item) => item.branch == userInfo.branch));
            }
            catch (error) {
                messageApi.error("unable to fetch")
            }
        };
        fetcher();
    }, [no]);

    let bankAccountNo = Number(brandings && brandings?.data[0]?.bankAccountNo) + 1;
    let brandingId = brandings && brandings?.data[0]?._id;
    
    if(!edit) {
        accountForm.setFieldValue("accountNo", bankAccountNo);
    }

    const onFinish = async (values) => {
        try {
            setLoading(true);

            // Convert dob Day.js object to ISO string BEFORE trim() processes it
            if (values.dob) values.dob = values.dob.toISOString();

            let finobj = trim(values);
            finobj.profile = photo ? photo : "https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif";
            finobj.signature = signature ? signature : "https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif";
            finobj.document = document ? document : "https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif";
            finobj.key = finobj.email;
            finobj.userType = "customer";
            finobj.branch = userInfo?.branch;
            finobj.createdBy = userInfo?.email;

            const httpreq = http(token);

            // POST /api/users creates the login account for the customer
            const { data } = await httpreq.post("/api/users", finobj);

            finobj.customerLoginId = data?.data._id;
            const obj = {
                email: finobj.email,
                password: finobj.password
            };
            await httpreq.post("/api/customers", finobj);
            await httpreq.post("/api/email", obj);
            await httpreq.put(`/api/branding/${brandingId}`, { bankAccountNo });

            onCloseModal();
            mutate("/api/branding");
            messageApi.success("Account created");
            setNo(no + 1);
        }
        catch (error) {
            const backendMsg = error.response?.data?.message || '';
            const field = error.response?.data?.field || '';
            if (error.response?.data?.error?.code == 11000 || backendMsg.includes('already exists')) {
                accountForm.setFields([{
                    name: field || 'email',
                    errors: [backendMsg || 'Email already exists']
                }]);
            }
            else if (field) {
                accountForm.setFields([{ name: field, errors: [backendMsg] }]);
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
        let filter = finalCustomer && finalCustomer.filter(cus => {
            if (cus.fullName.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.userType.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.email.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.branch.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.mobile.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.address.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.accountNo.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.createdBy.toLowerCase().indexOf(value) != -1) {
                return cus;
            }
            else if (cus.finalBalance.toString().toLowerCase().indexOf(value) != -1) {
                return cus;
            }
        })
        setAllCustomer(filter);
    };

    const onDelete = async (id, loginid) => {
        try {
            const httpreq = http(token);
            await httpreq.delete(`/api/customers/${id}`);
            await httpreq.delete(`/api/users/${loginid}`);

            messageApi.success("Customer deleted successfully");
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
        setSignature(obj.signature);
        setDocument(obj.document);
        
        if(copy.dob) copy.dob = dayjs(copy.dob);

        setAccountModel(true);
        accountForm.setFieldsValue(copy);
    };

    const updateData = async (values) => {
        try {
            setLoading(true);
            const finobj = trim(values);
            delete finobj.password;
            delete finobj.email;
            delete finobj.accountNo;
            
            if (photo) {
                finobj.profile = photo;
            }
            if (signature) {
                finobj.signature = signature;
            }
            if (document) {
                finobj.document = document;
            }
            
            const httpreq = http(token);
            await httpreq.put(`/api/customers/${edit._id}`, finobj);
            await httpreq.put(`/api/users/${edit.customerLoginId}`, finobj); 
            messageApi.success("updated successfully");
            onCloseModal(); 
            setNo(no + 1);
        }
        catch (error) {
            messageApi.error("Edit unsuccessful");
        }
        finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch'
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
            title: 'Account No',
            dataIndex: 'accountNo',
            key: 'accountNo'
        },
        {
            title: 'Balance',
            dataIndex: 'finalBalance',
            key: 'finalBalance'
        },
        {
            title: 'FullName',
            dataIndex: 'fullName',
            key: 'fullName'
        },
        {
            title: 'DOB',
            dataIndex: 'dob',
            key: 'dob',
            render: (d) => (
                <span>{formatDate(d)}</span>
            )
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
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy'
        },
        {
            title: 'Photo',
            key: 'photo',
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
            title: 'Signature',
            key: 'signature',
            render: (src, obj) => {
                return (
                    <Image
                        src={obj.signature}
                        className="rounded-full"
                        height={40}
                        width={40}
                    />
                )
            }
        },
        {
            title: 'Document',
            key: 'document',
            render: (src, obj) => {
                return (
                    <Image
                        src={obj.document}
                        className="rounded-full"
                        height={40}
                        width={40}
                    />
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            fixed: "right",
            render: (_, obj) => (
                <div className='flex gap-x-1'>
                    <Popconfirm title="Change Active" description="Do you want to toggle active" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onUpdate(obj._id, obj.isActive, obj.customerLoginId) }}>
                        <Button type='text' className={`${obj.isActive ? "!text-indigo-700 !bg-indigo-400" : "!text-pink-700 !bg-pink-400"}`} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
                    </Popconfirm>
                    <Popconfirm title="Edit Data" description="Do you want to edit data" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onEdit(obj) }}>
                        <Button type='text' className='!text-green-700 !bg-green-400' icon={<EditOutlined />} />
                    </Popconfirm>
                    <Popconfirm title="Delete Data" description="Do you want to delete data" onCancel={() => { messageApi.info("No changes") }} onConfirm={() => { onDelete(obj._id, obj.customerLoginId) }}>
                        <Button type='text' className='!text-rose-700 !bg-rose-400' icon={<DeleteOutlined />} />
                    </Popconfirm>

                </div>)
        }
    ];


    return (
        <div>
            {context}
            <div className='grid'>
                <Card
                    title="Account List"
                    style={{ overflowX: "auto" }}
                    extra={<div className='flex gap-x-3'>
                        <Input placeholder='Search by all'
                            prefix={<SearchOutlined />}
                            onChange={onSearch}
                        />
                        <Button type="text" className='!font-bold !bg-blue-500 !text-white' onClick={() => setAccountModel(true)}>
                            Add new account
                        </Button>
                    </div>
                    }>

                    <Table columns={columns} dataSource={allCustomer} scroll={{ x: "max-content" }} />


                </Card>
            </div>
            <Modal
                open={accountModel}
                onCancel={onCloseModal}
                width={820}
                footer={null}
                title="Open New Account"
            >
                <Form layout="vertical" onFinish={edit ? updateData : onFinish} form={accountForm}>
                    {
                        !edit &&
                        <div className="grid md:grid-cols-3 gap-x-3">
                            <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                                <Input disabled placeholder='Account No' />
                            </Item>
                            <Item label="Email" name="email" rules={[
                                { required: edit ? false : true, message: 'Email is required' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}>
                                <Input disabled={edit ? true : false} placeholder='Enter email' />
                            </Item>
                            <Item label="Enter Password" name="password" rules={[
                                { required: edit ? false : true, message: 'Password is required' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}>
                                <Input disabled={edit ? true : false} placeholder='Enter Password' />
                            </Item>
                        </div>
                    }
                    <div className="grid md:grid-cols-3 gap-x-3">

                        <Item label="Fullname" name="fullName" rules={[
                            { required: true, message: 'Full name is required' },
                            { min: 3, message: 'Name must be at least 3 characters' }
                        ]}>
                            <Input placeholder='Enter Fullname' />
                        </Item>
                        <Item label="Mobile" name="mobile" rules={[
                            { required: true, message: 'Mobile number is required' },
                            { pattern: /^\d{10}$/, message: 'Mobile must be exactly 10 digits' }
                        ]}>
                            <Input placeholder='Enter mobile' maxLength={10} />
                        </Item>
                        <Item label="Fathername" name="fatherName" rules={[
                            { required: true, message: "Father's name is required" },
                            { min: 3, message: 'Name must be at least 3 characters' }
                        ]}>
                            <Input placeholder='Enter Fathername' />
                        </Item>

                        <Item label="DOB" name="dob" rules={[{ required: true, message: 'Date of birth is required' }]}>
                            <DatePicker className="w-full" />
                        </Item>
                        <Item label="Gender" name="gender" rules={[{ required: true, message: 'Gender is required' }]}>
                            <Select placeholder="Select Gender" options={[
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "Other", value: "other" }
                            ]} />
                        </Item>
                        <Item label="Currency" name="currency" rules={[{ required: true, message: 'Currency is required' }]}>
                            <Select placeholder="Select Currency" options={[{ label: "INR", value: "inr" }, { label: "USD", value: "usd" }]} />
                        </Item>

                        <Item label="Photo">
                            <div className="flex flex-col gap-2">
                                <input 
                                    type="file" 
                                    className="ant-input p-1" 
                                    onChange={handlePhoto} 
                                    accept="image/*"
                                />
                                {photoLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                                {photo && !photoLoading && (
                                    <div className="mt-2">
                                        <Image src={photo} width={60} />
                                    </div>
                                )}
                            </div>
                        </Item>

                        <Item label="Signature">
                             <div className="flex flex-col gap-2">
                                <input 
                                    type="file" 
                                    className="ant-input p-1" 
                                    onChange={handleSignature} 
                                    accept="image/*"
                                />
                                {signatureLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                                {signature && !signatureLoading && (
                                    <div className="mt-2">
                                        <Image src={signature} width={60} />
                                    </div>
                                )}
                            </div>
                        </Item>

                        <Item label="Document">
                             <div className="flex flex-col gap-2">
                                <input 
                                    type="file" 
                                    className="ant-input p-1" 
                                    onChange={handleDocument} 
                                    accept="image/*" 
                                />
                                {documentLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                                {document && !documentLoading && (
                                    <div className="mt-2">
                                        <Image src={document} width={60} />
                                    </div>
                                )}
                            </div>
                        </Item>
                    </div>
                    <Item label="Address" name="address" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Item>
                    <Item className='flex justify-end items-center'>
                        <Button type="text" htmlType='submit' className='!font-semibold !text-white !bg-blue-500' loading={loading} >
                            Submit
                        </Button>
                    </Item>
                </Form>
            </Modal>
        </div>
    )
};
export default NewAccount;
