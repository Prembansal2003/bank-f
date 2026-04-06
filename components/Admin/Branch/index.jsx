import Adminlayout from '../../Layout/Adminlayout'
import {Input,Form,Card,Button,Table,message,Popconfirm} from 'antd'
import {EditOutlined,DeleteOutlined} from '@ant-design/icons'
import {trim,http} from '../../../modules/modules'
import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'       


const {Item}=Form;
const Branch=()=>{
    const cookie = new Cookies();
    const token = cookie.get('authToken');         
    const [branchForm]=Form.useForm();
    const [loading,setLoading]=useState(false);
    const [allBranch,setAllBranch]=useState([]);
    const [messageApi,context]=message.useMessage();
    const [no,setNo]=useState(0);
    const [edit,setEdit]=useState(null);
    useEffect(()=>{
        const fetcher=async()=>{
        const httpreq=http(token);
        try{
        const {data}=await httpreq.get("/api/branch");
        setAllBranch(data.data);
    }
        catch(error){
            messageApi.error("unable to fetch")
        }
        };
        fetcher();
},[no])
    const onDeleteBranch=async(id)=>{
        try{
            const httpreq=http(token);
            const {data}=await httpreq.delete(`/api/branch/${id}`);
            messageApi.success("Branch deleted successfully");
            setNo(no+1);
        }
        catch(error){
            messageApi.error("Deletion Failed");
        }
    }
    const onEditBranch=async(obj)=>{
    setEdit(obj);         
    branchForm.setFieldsValue(obj);
    };
    const updateData=async(values)=>{
        try{
            setLoading(true);
            const finobj=trim(values);
            const httpreq=http(token);
            await httpreq.put(`/api/branch/${edit._id}`,finobj);
            messageApi.success("Branch updated successfully !");
            setEdit(null);
            setNo(no+1);
            branchForm.resetFields();
        }
        catch(error){
            messageApi.error("Unable to update branch");
        }
        finally{
            setLoading(false);
        }
    };
    const onFinish=async(values)=>{
        try{
        setLoading(true);
        let finobj=trim(values);
        finobj.key= finobj.branchName;
        const httpreq=http(token);
        const {data}=await httpreq.post("/api/branch",finobj);
        branchForm.resetFields();   
        messageApi.success("Branch created");
        setNo(no+1);
        }
                catch(error){
            if(error.response?.data?.error?.code==11000){
                branchForm.setFields([        
                {
                    name: 'branchName',
                    errors: ['Branch already exists']
                }
            ]);
            }

            else{
                messageApi.error("Try Again");
            }
        } 
        finally{
            setLoading(false);
        }     
        
     };
    const columns=[
        {
         title:'Branch Name',
         dataIndex:'branchName',
         key:'branchName'   
        },
        {
         title:'Branch Address',
         dataIndex:'branchAddress',
         key:'branchAddress'   
        },
         {
         title:'Action',
         key:'action',
         fixed:"right",
         render:(_,obj)=>(
         <div className='flex gap-1'>
        <Popconfirm title="Edit Data" description="Do you want to edit data" onCancel={()=>{messageApi.info("No changes")}} onConfirm={()=>{onEditBranch(obj)}}>
                 <Button type='text' className='!text-green-700 !bg-green-400' icon={<EditOutlined />}/>
                           </Popconfirm>
        <Popconfirm title="Delete Data" description="Do you want to delete data" onCancel={()=>{messageApi.info("No changes")}} onConfirm={()=>{onDeleteBranch(obj._id)}}>
                  <Button type='text' className='!text-rose-700 !bg-rose-400' icon={<DeleteOutlined />}/>
                           </Popconfirm>

            </div>)
        }
];
    return (
       <Adminlayout >
        {context}
            <div className='grid md:grid-cols-3 gap-2'>
                <Card title='Add new branch'>
                    <Form layout='vertical' name='employee' onFinish={edit ? updateData :onFinish} form={branchForm}>
                        <Item label='Branch Name' name='branchName' rules={[{required:true}]}>
                                <Input/>
                        </Item>
                        <Item label='Branch Address' name='branchAddress'>
                            <Input.TextArea/>
                        </Item>
                        <Item>
                            { edit ?  <Button loading={loading} type='text' htmlType='submit' block className='!bg-red-500 !text-white !font-bold'>Update</Button>
                               :
                            <Button loading={loading} type='text' htmlType='submit' block className='!bg-blue-500 !text-white !font-bold'>Add Branch</Button>
    }
    </Item>
                    </Form>
                </Card>
                <Card className='col-span-2' title='Branch list' style={{overflowX:"auto"}} >
                        <Table columns={columns} dataSource={allBranch} scroll={{x:"max-content"}}/>
                </Card>
            </div>
        </Adminlayout>
    )
};
export default Branch; 
