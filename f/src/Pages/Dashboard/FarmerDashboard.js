import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import tracking from '../../Test.json'; // Replace with the path to your contract ABI JSON file
import Typewriter from "typewriter-effect"
import "./FarmerDashboard.css";
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with the deployed contract address
const contractABI = tracking.abi; // Replace with the contract ABI

export const FarmerDashboard=()=> {

  const [contract, setContract] = useState(null);
  const [signer,setSigner]= useState(null);
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const statusStrings = {
    0: 'PENDING',
    1: 'QUALITY_ASSESSED',
    2: 'ASSIGNED',
    3: 'PAYMENT_COMPLETED',
    4: 'IN_TRANSIT',
    5: 'DELIVERED'
  };

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    setSigner(signer);
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contract);
  }, []);


  const createOrder = async () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    // const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const fciAddress = await contract.getFCIAddress();

    console.log(fciAddress);
    const q = parseInt(quantity);
    
    // if (contract && fciAddress && quantity) {
      await contract.createOrder(fciAddress, q); // Use the entered quantity
      console.log("order created");
      setShowOrderForm(false); // Hide the form after creating the order
      getOrdersByFarmer(); // Update orders after creating a new one
    // }
    // else{
      console.log(contract);
      console.log(fciAddress);
      console.log(quantity);
    //}
  };

  const startDelivery = async (orderId) => {
    try {
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);

      await contract.startDelivery(orderId);
      console.log('Delivery started successfully');
      getOrdersByFarmer();
      // Update UI or state as needed
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  };
  
  const getOrdersByFarmer = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const farmerAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!Array.isArray(farmerAddress) || farmerAddress.length === 0) {
        console.error('Invalid farmer address:', farmerAddress);
        return;
    }
    console.log("array be array");
      console.log(farmerAddress[0]);
      console.log(typeof(farmerAddress));
      const farmerOrders = await contract.getOrdersByFarmer(farmerAddress[0]);
      console.log(farmerOrders);

      // Format the orders before setting them in state
      const formattedOrders = farmerOrders.map(order => ({
        orderId: order.orderId,
        dateTime: new Date(order.dateTime * 1000).toLocaleDateString(),
        quantity: order.quantity,
        status: order.status,
        fci: order.fci,
        assignedMiller: order.assignedMiller
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(()=>{
    getOrdersByFarmer();
  },[]);

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await signer.getAddress();
      setAddress(address);
    } else {
      alert('Please install MetaMask');
    }
  };

  
  console.log(orders);

  

  return (
    <div className="dashboard">
       <div className='connect-wallet'>
      <button onClick={connectWallet}>Connect Wallet</button>
      <br />
      <label>
        Address: {address}
      </label>
      </div>
      <h1>
      <Typewriter
       options={{
        strings: [' Welcome to Farmer Dashboard'],
        autoStart: true,
        loop: true,
      }}/>
      </h1>
      
      {showOrderForm ? (
        <div className="order-form">
          <h2>Create Paddy Order</h2>
          <label>Quantity: </label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button onClick={createOrder}>Create</button>
          <button onClick={() => setShowOrderForm(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowOrderForm(true)}>Create Paddy Order</button>
      )}
      <h2>Order History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Expiry Date</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>FCI Name</th>
            <th>Miller Name</th>
            <th>Action</th> {/* Added column for Start Delivery button */}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            // Convert dateTime to Unix timestamp
          const dateTimeParts = order.dateTime.split('/'); // Splitting the date string
          const creationDate = new Date(`${dateTimeParts[1]}/${dateTimeParts[0]}/${dateTimeParts[2]}`);
          const expiryDate = new Date(creationDate);
          expiryDate.setDate(expiryDate.getDate() + 4); // Adding 4 days to the creation date
            return (
              <tr key={order.orderId}>
                <td>{creationDate.toLocaleDateString()}</td>
                <td>{expiryDate.toLocaleDateString()}</td>
                <td>{order.quantity.toString()}</td>
                <td>{statusStrings[order.status]}</td>
                <td>{order.fci}</td>
                <td>{order.assignedMiller}</td>
                <td>
                  {order.status === 3 && ( // Show button only when status is PAYMENT_COMPLETED
                    <button onClick={() => startDelivery(order.orderId)}>Start Delivery</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

