import { Button, Card, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout"
import { EditFilled } from "@ant-design/icons";
import { Form } from "antd";
import { http, trim } from "../../../modules/modules"
import { useEffect, useState } from "react";
const { Item } = Form;
import Cookies from 'universal-cookie'    
const Branding = () => {
        const cookie = new Cookies();
    const token = cookie.get('authToken');


    const [bankForm] = Form.useForm();
    const [messageApi, context] = message.useMessage();
    const [loading,setLoading]=useState(false);
    const [photo,setPhoto]= useState(null)
    const [brandings,setBrandings]= useState(null)
    const [no,setNo]= useState(0);
    const [edit, setEdit]= useState(false);

     useEffect(()=>{
            const fetcher=async()=>{
            const httpreq=http(token);
            try{
            const {data}=await httpreq.get("/api/branding");
            bankForm.setFieldsValue(data?.data[0]);
            setBrandings(data.data[0]);
            setEdit(true);
        }
            catch(error){
                messageApi.error("unable to fetch")
            }
            };
            fetcher();
    },[no])

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const finalObj = trim(values);
            finalObj.bankLogo=photo?photo:"https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif";
            const userInfo = {
                email: finalObj.email,
                fullname: finalObj.fullname,
                password: finalObj.password,
                userType: "admin",
                isActive: true,
                profile: "https://res.cloudinary.com/dvbobb4ro/image/upload/v1769068202/ciyvut93xzrmmxmq8g9g.avif"
            }
            const httpReq = http(token);
            await httpReq.post("/api/branding", finalObj);
            await httpReq.post("/api/users", userInfo);
            messageApi.success("Branding created successfully !");
            bankForm.resetFields();
            setPhoto(null);
            setNo(no+1);
        }
        catch (err) {
            messageApi.error("Unable to store branding!");
        }
        finally{
            setLoading(false);
        }
    }
    const onUpdate = async (values) => {
        try {
            setLoading(true);
            const finalObj = trim(values);
            if(photo){
                finalObj.bankLogo=photo;
            }            
            const httpReq = http(token);
            await httpReq.put(`/api/branding/${brandings._id}`, finalObj);
            messageApi.success("Branding updated successfully !");
            bankForm.resetFields();
            setPhoto(null);
            setNo(no+1);
        }
        catch (err) {
            messageApi.error("Unable to update branding!");
        }
        finally{
            setLoading(false);
        }
    }
    const fileupload=async(e)=>{
        let file=e.target.files[0];
        const form=new FormData();
        form.append("photo",file);
        const httpreq=http(token);
        const {data}=await httpreq.post("/api/upload",form);
        
        let imageUrl=data.filePath;
      if (imageUrl && imageUrl.startsWith("http:")) {
         imageUrl = imageUrl.replace("http:", "https:");
      }
      if (imageUrl && imageUrl.includes("https:/") && !imageUrl.includes("https://")) {
         imageUrl = imageUrl.replace("https:/", "https://");
      }
            setPhoto(imageUrl); 
    }
    return (
        <Adminlayout>
            {context}
            <Card
                title="Bank details"
                extra={
                    <Button onClick={()=>{setEdit(!edit)}} icon={<EditFilled />} />
                }
            >
                <Form
                    form={bankForm}
                    layout="vertical"
                    onFinish={brandings ? onUpdate : onFinish}
                    disabled={edit}
                >
                    <div className="grid md:grid-cols-3 gap-x-3">
                        <Item
                            label="Bank Name"
                            name="bankName"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Bank Tagline"
                            name="bankTagline"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Bank Logo"
                            name="xyz"
                        >
                            <Input type="file" onChange={fileupload}/>
                        </Item>
                        <Item
                            label="Bank Account No"
                            name="bankAccountNo"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Bank Account Transaction Id"
                            name="bankTransactionId"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Bank Address"
                            name="bankAddress"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Item>
                        <div className={`${brandings ? "hidden" : "md:col-span-3 grid md:grid-cols-3 gap-x-3"}`}>
                        <Item
                            label="Admin Fullname"
                            name="fullname"
                            rules={[{ required: brandings ? false : true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Admin Email"
                            name="email"
                            rules={[{ required: brandings ? false : true }]}
                        >
                            <Input />
                        </Item>
                        <Item
                            label="Admin Password"
                            name="password"
                            rules={[{ required: brandings ? false : true }]}
                        >
                            <Input.Password />
                        </Item>
                        </div>
                        <Item
                            label="Bank LinkedIn"
                            name="bankLinkedIn"
                        >
                            <Input type="url" />
                        </Item>
                        <Item
                            label="Bank Twitter"
                            name="bankTwitter"
                        >
                            <Input type="url" />
                        </Item>
                        <Item
                            label="Bank Facebook"
                            name="bankFacebook"
                        >
                            <Input type="url" />
                        </Item>
                    </div>
                    <Item
                        label="Bank description"
                        name="bankDesc"
                    >
                        <Input.TextArea />
                    </Item>
                   {
                    brandings ?
                     <Item className="flex justify-end items-center">
                        <Button
                            loading={loading}
                            type="text"
                            htmlType="submit"
                            className="!bg-rose-500 !text-white !font-bold"
                        >
                            Update
                        </Button>
                    </Item>
                    :
                     <Item className="flex justify-end items-center">
                        <Button
                            loading={loading}
                            type="text"
                            htmlType="submit"
                            className="!bg-blue-500 !text-white !font-bold"
                        >
                            Sumbit
                        </Button>
                    </Item>

                   }
                </Form>
            </Card>
        </Adminlayout>
    )
}
export default Branding;
