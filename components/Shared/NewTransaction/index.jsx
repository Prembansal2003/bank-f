import { SearchOutlined } from "@ant-design/icons"; 
import { Button, Card, Empty, Form, Image, Input, message, Select } from "antd"; 
import { useState } from "react";
import { http, trim,formatDate } from "../../../modules/modules";
import Cookies from "universal-cookie";
const {Item}=Form;

const NewTransaction = () => {
    const cookie=new Cookies();
    const token=cookie.get("authToken");
    const userInfo=JSON.parse(sessionStorage.getItem("userInfo"));
    const [transactionForm] = Form.useForm();
    const [accountNo, setAccountNo] = useState(null);
    const [accountDetail, setAccountDetail] = useState(null);
    const [messageApi,context]=message.useMessage();

    const searchByAccountNo = async () => {
        try{
            const obj={
                accountNo,
                branch:userInfo?.branch,
            }
            const httpreq=http(token);
            const {data}=await httpreq.post(`api/find-by-account`,obj);
            if(data?.data){
                setAccountDetail(data?.data);
            }
            else{
                messageApi.warning("No record Found");
                setAccountDetail(null);
            }
        }
        catch(error){
            messageApi.error("Unable to find account details")
         }
    }

    const onFinish = async (values) => {
        try{
            const finobj=trim(values);
            let balance=0;
            if(finobj.transactionType=="cr"){
                balance=Number(accountDetail?.finalBalance)+Number(finobj.transactionAmount);
            }
            else if(finobj.transactionType=="dr"){
                balance=Number(accountDetail?.finalBalance)-Number(finobj.transactionAmount);
            }
            finobj.currentBalance=accountDetail.finalBalance;
            finobj.customerId=accountDetail._id;
            finobj.accountNo=accountDetail.accountNo;
            finobj.branch=userInfo.branch;
            const httpreq=http(token);
            await httpreq.post("/api/transaction",finobj);
            await httpreq.put(`/api/customers/${accountDetail?._id}`,{finalBalance:balance});
            messageApi.success("Transaction created successfully");
            transactionForm.resetFields();
            setAccountDetail(null);
        }
            catch(error){
        messageApi.error(error?.response?.data?.message || "Unable to process transaction")
    }

    };

    return (
        <div>
            {context}
            <Card
                title="New Transaction"
                extra={
                    <Input
                        placeholder="Enter Account Number"
                        onChange={(e) => setAccountNo(e.target.value)}
                        addonAfter={
                            <SearchOutlined
                                onClick={searchByAccountNo}
                                style={{ cursor: "pointer" }}
                            />
                        }
                    />
                }
            >
                {accountDetail ? (
                    <div>
                        <div className="flex items-center justify-start gap-2">
                            <Image src={accountDetail.profile} width={120} className="rounded-full" />
                            <Image src={accountDetail.signature} width={120} className="rounded-full" />
                        </div>

                        <div className="mt-5 grid md:grid-cols-3 gap-8">
                            <div className="mt-3 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <b>Name: </b> <b>{accountDetail.fullName}</b>
                                </div>
                                <div className="flex justify-between items-center">
                                    <b>Mobile No: </b> <b>{accountDetail?.mobile}</b>
                                </div>
                                <div className="flex justify-between items-center">
                                    <b>Balance: </b> <b>{accountDetail?.currency=="inr"?"₹":"$"}{accountDetail?.finalBalance}</b>
                                </div>
                                <div className="flex justify-between items-center">
                                    <b>DOB: </b> <b>{formatDate(accountDetail?.dob)}</b>
                                </div >
                                <div className="flex justify-between items-center">
                                    <b>Currency: </b> <b>{accountDetail?.currency}</b>
                                </div> 
                            </div>

                            <div></div>

                            <div>
                                <Form layout="vertical" onFinish={onFinish} form={transactionForm}>
                                    <div className="grid md:grid-cols-2 gap-x-3">
                                        <Item label="Transaction Type" name="transactionType" rules={[{ required: true, message: 'Please select a transaction type' }]}>
                                            <Select
                                                placeholder="Transaction Type"
                                                options={[
                                                    { label: "CR", value: "cr" },
                                                    { label: "DR", value: "dr" }
                                                ]}
                                            />
                                        </Item>

                                        <Item label="Transaction Amount" name="transactionAmount" rules={[
                                            { required: true, message: 'Amount is required' },
                                            {
                                                validator(_, value) {
                                                    if (!value || Number(value) <= 0)
                                                        return Promise.reject('Amount must be greater than 0');
                                                    const type = transactionForm.getFieldValue('transactionType');
                                                    if (type === 'dr' && Number(value) > Number(accountDetail?.finalBalance))
                                                        return Promise.reject(`Insufficient balance. Available: ${accountDetail?.finalBalance}`);
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}>
                                            <Input placeholder="500.00" type="number" min={1} />
                                        </Item>

                                        <Item label="Category" name="category" rules={[{ required: true, message: 'Please select a category' }]}>
                                            <Select
                                                placeholder="Select Category"
                                                options={[
                                                    { label: "Salary", value: "salary" },
                                                    { label: "Deposit", value: "deposit" },
                                                    { label: "Withdrawal", value: "withdrawal" },
                                                    { label: "Transfer", value: "transfer" },
                                                    { label: "Loan", value: "loan" },
                                                    { label: "Fee", value: "fee" },
                                                    { label: "Other", value: "other" }
                                                ]}
                                            />
                                        </Item>

                                        <div className="md:col-span-2">
                                            <Item label="Notes" name="notes" rules={[
                                                { max: 300, message: 'Notes cannot exceed 300 characters' }
                                            ]}>
                                                <Input.TextArea placeholder="Optional notes..." maxLength={300} showCount />
                                            </Item>

                                            <Item label="Reference" name="refrence">
                                                <Input.TextArea />
                                            </Item>

                                            <Item>
                                                <Button htmlType="submit" type="text" className="!bg-blue-500 !text-white !font-semibold w-full">
                                                    Submit
                                                </Button>
                                            </Item>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Empty />
                )}
            </Card>
        </div>
    );
};

export default NewTransaction;
