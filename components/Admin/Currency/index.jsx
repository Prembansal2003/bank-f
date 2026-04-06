import Adminlayout from '../../Layout/Adminlayout'
import {Input,Form,Card,Button,Table,message,Popconfirm} from 'antd'
import {EditOutlined,DeleteOutlined} from '@ant-design/icons'
import {trim,http} from '../../../modules/modules'
import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'    
const {Item}=Form;
const Currency=()=>{
    const cookie = new Cookies();
    const token = cookie.get('authToken');

    const [currencyForm]=Form.useForm();
    const [loading,setLoading]=useState(false);
    const [allCurrency,setAllCurrency]=useState([]);
    const [messageApi,context]=message.useMessage();
    const [no,setNo]=useState(0);
    const [edit,setEdit]=useState(null);
    useEffect(()=>{
        const fetcher=async()=>{
        const httpreq=http(token);
        try{
        const {data}=await httpreq.get("/api/currency");
        setAllCurrency(data.data);
    }
        catch(error){
            messageApi.error("unable to fetch")
        }
        };
        fetcher();
},[no])
    const onDeleteCurrency=async(id)=>{
        try{
            const httpreq=http(token);
            const {data}=await httpreq.delete(`/api/currency/${id}`);
            messageApi.success("Currency deleted successfully");
            setNo(no+1);
        }
        catch(error){
            messageApi.error("Deletion Failed");
        }
    }
    const onEditCurrency=async(obj)=>{
    setEdit(obj);         
    currencyForm.setFieldsValue(obj);
    };
    const updateData=async(values)=>{
        try{
            setLoading(true);
            const finobj=trim(values);
            const httpreq=http(token);
            await httpreq.put(`/api/currency/${edit._id}`,finobj);
            messageApi.success("currency updated successfully !");
            setEdit(null);
            setNo(no+1);
            currencyForm.resetFields();
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
        finobj.key= finobj.currencyName;
        const httpreq=http(token);
        const {data}=await httpreq.post("/api/currency",finobj);
        currencyForm.resetFields();   
        messageApi.success("Currency created");
        setNo(no+1);
        }
        catch(error){
            if(error.response?.data?.error?.code==11000){
                currencyForm.setFields([
                {
                    name: 'currencyName',
                    errors: ['currency already exists']
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
         title:'Currency Name',
         dataIndex:'currencyName',
         key:'currencyName'   
        },
        {
         title:'Currency Description',
         dataIndex:'currencyDesc',
         key:'currencyDesc'   
        },
         {
         title:'Action',
         key:'action',
         fixed:"right",
         render:(_,obj)=>(
         <div className='flex gap-1'>
        <Popconfirm title="Edit Data" description="Do you want to edit data" onCancel={()=>{messageApi.info("No changes")}} onConfirm={()=>{onEditCurrency(obj)}}>
                 <Button type='text' className='!text-green-700 !bg-green-400' icon={<EditOutlined />}/>
                           </Popconfirm>
        <Popconfirm title="Delete Data" description="Do you want to delete data" onCancel={()=>{messageApi.info("No changes")}} onConfirm={()=>{onDeleteCurrency(obj._id)}}>
                  <Button type='text' className='!text-rose-700 !bg-rose-400' icon={<DeleteOutlined />}/>
                           </Popconfirm>

            </div>)
        }
];
    return (
       <Adminlayout >
        {context}
            <div className='grid md:grid-cols-3 gap-2'>
                <Card title='Add new currency'>
                    <Form layout='vertical' name='employee' onFinish={edit ? updateData :onFinish} form={currencyForm}>
                        <Item label='Currency Name' name='currencyName' rules={[{required:true}]}>
                                <Input/>
                        </Item>
                        <Item label='Currency Description' name='currencyDesc'>
                            <Input.TextArea/>
                        </Item>
                        <Item>
                            { edit ?  <Button loading={loading} type='text' htmlType='submit' block className='!bg-red-500 !text-white !font-bold'>Update</Button>
                               :
                            <Button loading={loading} type='text' htmlType='submit' block className='!bg-blue-500 !text-white !font-bold'>Add Currency</Button>
    }
    </Item>
                    </Form>
                </Card>
                <Card className='col-span-2' title='Currency list' style={{overflowX:"auto"}} >
                        <Table columns={columns} dataSource={allCurrency} scroll={{x:"max-content"}}/>
                </Card>
            </div>
        </Adminlayout>
    )
};
export default Currency; 
