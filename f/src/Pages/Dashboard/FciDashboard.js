import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
//import { Sidebar } from './Sidebar.js';
import tracking from '../../Test.json'; 
import "./FciDashboard.css";
import Typewriter from "typewriter-effect"
import { backend } from '../../config.js';
import axios from 'axios';
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; 
const contractABI = tracking.abi; 

export const FciDashboard = () => {
  const [contract, setContract] = useState(null);
  const [signer,setSigner]= useState(null);
  const [address, setAddress] = useState('');
  const [farmersList, setFarmersList] = useState([]);
  const [millersList, setMillersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [miller, setMiller] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  // const [millerCapacity, setMillerCapacity] = useState({
  //   maxStorageCapacity: 0,
  //   targetQuantity: 0,
  //   availableCapacity: 0
  // });
  const [millerCapacity, setMillerCapacity] = useState({});
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
    loadFarmersList();
    loadMillersList();
  }, []);

  const loadFarmersList = async () => {
    try {
      const response = await axios.get(`${backend}/farmers`);
      setFarmersList(response.data);
    } catch (error) {
      console.error('Error fetching farmers list:', error);
    }
  };

  const loadMillersList = async () => {
    try {
      const response = await axios.get(`${backend}/millers`);
      setMillersList(response.data);
      // Fetch capacity for each miller
      response.data.forEach(async (miller) => {
        console.log(miller.address);
        //const capacity = await getMillerCapacity(miller.address);
        updateMillerCapacity(miller.address, await getMillerCapacity(miller.address));
      });
    } catch (error) {
      console.error('Error fetching millers list:', error);
    }
  };

  // const getMillerCapacity = async (millerAddress) => {
  //   try {
  //     if (contract && millerAddress) {
  //       const capacity = await contract.getMillerCapacity(millerAddress);
  //       console.log(capacity);
  //       setMillerCapacity({
  //         maxStorageCapacity: capacity[0].toString(),
  //         targetQuantity: capacity[1].toString(),
  //         availableCapacity: capacity[2].toString()
  //       });
  //       console.log(millerCapacity);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching miller capacity:', error);
  //   }
  // };

  const getMillerCapacity = async (millerAddress) => {
    try {
      if (contract && millerAddress) {
        const capacity = await contract.getMillerCapacity(millerAddress);
        const newMillerCapacity = {
          maxStorageCapacity: capacity[0].toString(),
          targetQuantity: capacity[1].toString(),
          availableCapacity: capacity[2].toString()
        };
        setMillerCapacity(prevState => ({
          ...prevState,
          [millerAddress]: newMillerCapacity
        }));
      }
    } catch (error) {
      console.error('Error fetching miller capacity:', error);
    }
  };
  console.log(millerCapacity);
  getMillerCapacity(miller);

  const updateMillerCapacity = (millerAddress, capacity) => {
    setMillersList((prevMillers) => {
      return prevMillers.map((miller) => {
        if (miller.address === millerAddress) {
          return {
            ...miller,
            maxStorageCapacity: capacity ? capacity.maxStorageCapacity : 0,
            targetQuantity: capacity ? capacity.targetQuantity : 0,
            availableCapacity: capacity ? capacity.availableCapacity : 0
          };
        }
        return miller;
      });
    });
  };
  


  const assignMiller = async (farmer, orderId, miller) => {
    if (contract) {
      try {
        await contract.assignMiller(farmer, orderId,miller);
        console.log('Miller Assigned successfully');
        
      } catch (error) {
        console.error('Error assigning miller:', error);
      }
    }
  }

  const assessQuality = async (farmer, orderId) => {
    if (contract) {
      try {
        await contract.assessQuality(farmer, orderId);
        console.log('Quality assessed successfully');
        
      } catch (error) {
        console.error('Error assessing quality:', error);
      }
    }
  };

  const completePayment = async (farmerAddress,orderId,quantity) => {
    if (contract) {
      try {
        // Assuming payment amount is calculated based on quantity
        const paymentAmount = quantity * 2;
        // console.log(farmerAddress);
        await contract.completePayment(farmerAddress, orderId, quantity, {
          value: ethers.utils.parseEther(paymentAmount.toString()),
        });
        console.log('Payment completed successfully');
        
      } catch (error) {
        console.error('Error completing payment:', error);
      }
    }
  };

  const loadTransactions = async () => {
     try{
      if (contract){
        const txns = await contract.getAllTransactionsOfFCI();
        setOrders(txns);
        setShowTransactions(true);
        console.log('Transactions:', txns);
      }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    
  };

  useEffect(() => {
    loadTransactions();
    getMillerCapacity();
  }, [contract]);

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
        strings: [' Welcome to FCI Dashboard'],
        autoStart: true,
        loop: true,
      }}/>
      </h1>
      <div className="content">
      <h3>Farmer List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {farmersList.map((farmer, index) => (
              <tr key={index}>
                <td>{farmer.name}</td>
                <td>{farmer.phone}</td>
                <td>{farmer.email}</td>
                <td>{farmer.address}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Miller List</h3>
        {millersList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Max Storage Capacity</th>
              <th>Target Quantity</th>
              <th>Available Capacity</th>
            </tr>
          </thead>
          <tbody>
            {millersList.map((miller, index) => (
              <tr key={index}>
                <td>{miller.name}</td>
                <td>{miller.phone}</td>
                <td>{miller.email}</td>
                <td>{miller.address}</td>
                <td>{millerCapacity?.maxStorageCapacity}</td>
                <td>{millerCapacity?.targetQuantity}</td>
                <td>{millerCapacity?.availableCapacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

      </div>
      <div>
  <h2>Pending Orders</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Expiry Date</th>
        <th>Order ID</th>
        <th>From Farmer</th>
        <th>Assigned Miller</th>
        <th>Quantity</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  {orders.map((order, index) => {
    const dateTime = order.dateTime.toString(); // Convert BigNumber to string
    const timestamp = parseInt(dateTime, 10); // Convert string to integer timestamp
    const creationDate = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
    const expiryDate = new Date(creationDate);
    expiryDate.setDate(expiryDate.getDate() + 4); // Adding 4 days to the creation date

    return (
      <tr key={index}>
        <td>{creationDate.toLocaleDateString()}</td>
        <td>{expiryDate.toLocaleDateString()}</td>
        <td>{order.orderId.toString()}</td>
        <td>{order.farmer}</td>
        <td>{order.assignedMiller}</td>
        <td>{order.quantity.toString()}</td>
        <td>{statusStrings[order.status]}</td>
        <td>
          {order.status === 0 && (
            <button onClick={() => assessQuality(order.farmer, order.orderId)}>Assess Quality</button>
          )}
          {order.status === 1 && (
            <>
              <input type="text" value={miller} onChange={(e) => setMiller(e.target.value)} placeholder="Enter Miller Address" />
              <button onClick={() => assignMiller(order.farmer, order.orderId, miller)}>Assign Miller</button>
            </>
          )}
          {order.status === 2 && (
            <button onClick={() => completePayment(order.farmer.toString(), order.orderId.toString(), order.quantity.toString())}>Complete Payment</button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

  </table>
</div>

    </div>
    
  );
};
