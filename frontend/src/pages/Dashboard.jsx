import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Flex, Spin, Table, Input, Form, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getToken = () =>{
    if(localStorage.getItem('user')){
        const user = JSON.parse(localStorage.getItem('user'));
        console.log(user.accessToken)
        return user.accessToken;
    }
} 

axios.defaults.headers.common['Authorization'] = `Bearer ${getToken()}`;

const fetchData = async () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get("http://localhost:8080/data");
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

const Dashboard = () => {
    const [sidebar, setSidebar] = useState("home");
    const [filteredData, setFilteredData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [fcount, setfCount] = useState(null);
    const [searchText, setSearchText] = useState("");
    
    const { data, error, isLoading } = useQuery('data', fetchData, {
        staleTime: 60000, 
        cacheTime: 300000, 
    });

    const handleFormSubmit = async (values) => {
        try {
            await axios.post("http://localhost:8080/data", values);
            notification.success({
                message: 'Success',
                description: 'Data added successfully.',
            });
        } catch (error) {
            console.error('Error adding data:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to add data.',
            });
        }
    };

    const columns = [
        {
            title: 'Step',
            dataIndex: 'step',
            key: 'step',
            sorter: (a, b) => a.step - b.step,
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
            sorter: (a, b) => a.customer.localeCompare(b.customer),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: (a, b) => a.age - b.age,
            filters: [
                { text: '1', value: '1' },
                { text: '2', value: '2' },
                { text: '3', value: '3' },
                { text: '4', value: '4' },
                { text: '5', value: '5' },
            ],
            onFilter: (value, record) => record.age==(value),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            filters: [
                { text: 'Male', value: 'M' },
                { text: 'Female', value: 'F' },
            ],
            onFilter: (value, record) => record.gender.includes(value),
        },
        {
            title: 'Zip Code (Original)',
            dataIndex: 'zipcodeori',
            key: 'zipcodeori',
            sorter: (a, b) => a.zipcodeOri.localeCompare(b.zipcodeOri),
        },
        {
            title: 'Merchant',
            dataIndex: 'merchant',
            key: 'merchant',
            sorter: (a, b) => a.merchant.localeCompare(b.merchant),
        },
        {
            title: 'Zip Code (Merchant)',
            dataIndex: 'zipmerchant',
            key: 'zipmerchant',
            sorter: (a, b) => a.zipMerchant.localeCompare(b.zipMerchant),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
            filters: categories.map(item => ({
                text: item.category,
                value: item.category
            })),
            onFilter: (value, record) => record.gender.includes(value),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Fraud',
            dataIndex: 'fraud',
            key: 'fraud',
            sorter: (a, b) => a.fraud - b.fraud,
            render: (text) => (text ? 'Yes' : 'No'),
            filters: [
                { text: 'Yes', value: true },
                { text: 'No', value: false },
            ],
            onFilter: (value, record) => record.fraud === value
        },
    ];

    const fetchFraud = async () => {
        try {
            const response = await axios.get("http://localhost:8080/fraud/count");
            setfCount(response.data[0].count);
        } catch (error) {
            console.log(error);
        }
    };
    
    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/data/categories");
            setCategories(response.data);
        } catch (error) {
            console.log(error);
        }
    };
    
    useEffect(() => {
        fetchCategories();
        fetchFraud();
    }, []);

    useEffect(() => {
        if(data){
            const filtered = data.filter((item) => {
                const { age, ...rest } = item;
                return Object.values(rest).some((value) =>
                    value.toString().toLowerCase().includes(searchText.toLowerCase())
                );
            });
            setFilteredData(filtered);
        }
    }, [searchText, data]);
    

    const labels = categories.map(item => item.category);
    const counts = categories.map(item => item.count);

    const barData = {
        labels: labels,
        datasets: [{
            label: 'Category Count',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    return (
        <div className='h-screen w-full grid grid-cols-10 overflow-hidden'>
            <div className='bg-slate-900 col-span-2 flex flex-col text-white p-5 gap-3'>
                <button className='bg-red-800 p-3 rounded-md font-semibold' onClick={() => setSidebar("create")}>
                    + Add Data
                </button>
                <button className='bg-red-800 p-3 rounded-md font-semibold' onClick={() => setSidebar("home")}>
                    Home
                </button>
                <div className='footer flex flex-col items-center mt-auto'>
                    <div className='flex items-center'>
                    <img className='w-2/5' src="justlogo.png"></img>
                    <button className='ml-auto'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"/></svg>
                    </button>
                    </div>
                </div>
            </div>
            <div className='col-span-8 overflow-scroll'>
                {isLoading ?
                <div className='w-full h-full flex flex-col items-center justify-center'> <Flex align="center" gap="middle">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 96, color: "red" }} spin />} />
              </Flex></div> :<>
              {sidebar === "create" && (
                            <div className='py-10 px-40'>
                                <h1 className='font-semibold text-2xl mb-5'>Add Data</h1>
                                <Form
                                    name="add_data"
                                    layout="vertical"
                                    onFinish={handleFormSubmit}
                                    initialValues={{
                                        step: '',
                                        customer: '',
                                        age: '',
                                        gender: '',
                                        zipcodeOri: '',
                                        merchant: '',
                                        zipMerchant: '',
                                        category: '',
                                        amount: '',
                                        fraud: false
                                    }}
                                >
                                    <Form.Item label="Step" name="step" rules={[{  message: 'Please input step!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Customer" name="customer" rules={[{  message: 'Please input customer!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Age" name="age" rules={[{  message: 'Please input age!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Gender" name="gender" rules={[{  message: 'Please select gender!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Zip Code (Original)" name="zipcodeOri" rules={[{  message: 'Please input original zip code!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Merchant" name="merchant" rules={[{  message: 'Please input merchant!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Zip Code (Merchant)" name="zipMerchant" rules={[{  message: 'Please input merchant zip code!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Category" name="category" rules={[{  message: 'Please select category!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Amount" name="amount" rules={[{  message: 'Please input amount!' }]}>
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item label="Fraud" name="fraud" valuePropName="checked">
                                        <Input type="checkbox" />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            Add Data
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                {sidebar === "home" && (
                    <div className='p-10'>
                        <h1 className='font-semibold text-2xl'>
                            Home
                        </h1>
                        <div className='grid grid-cols-3'>
                            <div className='col-span-2 p-2'>
                                <Bar data={barData} options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Category Count',
                                    },
                                },
                                }} />
                            </div>
                            <div className='col-span-1 grid grid-rows-2 text-white font-semibold'>
                                <div className='row-span-1 p-5'>
                                    <div className='w-full h-full bg-red-700 rounded-md px-4 py-2'>
                                        <h1 className='mb-2'>Fraud Count</h1>
                                        <h1 className='text-6xl text-end ml-auto mt-auto'>{fcount}</h1>
                                    </div>
                                </div>
                                <div className='row-span-1 p-5'>
                                <div className='w-full h-full bg-red-700 rounded-md px-4 py-2'>
                                        <h1 className='mb-2'>Number of Transactions</h1>
                                        <h1 className='text-6xl text-end ml-auto mt-auto'>{data.length}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='w-full'>
                            <h1 className='font-semibold text-xl mb-4 mt-5'>
                                Data
                            </h1>
                            <Input.Search
                                placeholder="Search"
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ marginBottom: 20 }}
                            />
                            <Table dataSource={filteredData} columns={columns} scroll={{ x: true }}/>
                        </div>
                    </div>
                )}
                {sidebar === "fraud" && <></>}</>}
                {/* Add other sidebar content here */}
            </div>
        </div>
    );
};

export default Dashboard;
