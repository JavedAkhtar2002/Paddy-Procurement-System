import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import tracking from '../../Test.json'; 
import "./MillerDashboard.css"
import Typewriter from "typewriter-effect"
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; 
const contractABI = tracking.abi;

export const MillerDashboard = () => {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [millerAddress, setMillerAddress] = useState('');
  const [porders, setPorders] = useState([]);
  const [aorders,setAorders]=useState([]);
  const [loading, setLoading] = useState(false);
  const [targetQuantity,setTargetQuantity]=useState(0);
  const [millerCapacity, setMillerCapacity] = useState({
    maxStorageCapacity: 0,
    targetQuantity: 0,
    availableCapacity: 0
  });
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

  const getMillerCapacity = async () => {
    try {
      if (contract && millerAddress) {
        // Call the getMillerCapacity function
        const capacity = await contract.getMillerCapacity(millerAddress); // Replace addressOfMiller with the actual address of the miller
        console.log(capacity);
        // Update state with the retrieved data
        setMillerCapacity({
          maxStorageCapacity: capacity[0].toString(),
          targetQuantity: capacity[1].toString(),
          availableCapacity: capacity[2].toString()
        });
      }
    } catch (error) {
      console.error('Error fetching miller capacity:', error);
    }
  };

  getMillerCapacity();

  const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
          await contract.setTargetQuantity(targetQuantity);
          alert('Target quantity set successfully');
        } catch (error) {
          console.error('Error setting target quantity:', error);
          alert('Failed to set target quantity');
        }
        setLoading(false);
      };

      const confirmDelivery = async (farmer, orderId) => {
        try {
          await contract.confirmDelivery(farmer, orderId);
          console.log('Delivery confirmed successfully');
          getAceptedOrdersByMiller();
          getPendingOrdersByMiller();
        } catch (error) {
          console.error('Error confirming delivery:', error);
        }
      };

      // const confirmDelivery = async (farmer, orderId) => {
      //   try {
      //     await contract.confirmDelivery(farmer, orderId);
      //     console.log('Delivery confirmed successfully');
      //     const updatedAorders = aorders.map(order => {
      //       if (order.orderId === orderId) {
      //         return { ...order, receivedDate: new Date().toLocaleDateString() };
      //       }
      //       return order;
      //     });
      //     setAorders(updatedAorders);
      //     getAceptedOrdersByMiller();
      //     getPendingOrdersByMiller();
      //   } catch (error) {
      //     console.error('Error confirming delivery:', error);
      //   }
      // };
      

  const getPendingOrdersByMiller = async () => {
    if (contract) {
      const contractWithSigner = contract.connect(signer);
      const millerAddress = await signer.getAddress();
      setMillerAddress(millerAddress);
      console.log('Miller Address:', millerAddress);
      
      try {
        const millerOrders = await contractWithSigner.getPendingOrdersByMiller(millerAddress);
        console.log('Miller Orders:', millerOrders);
        setPorders(millerOrders);
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    }
  };

  const getAceptedOrdersByMiller = async () => {
    if (contract) {
      const contractWithSigner = contract.connect(signer);
      const millerAddress = await signer.getAddress();
      console.log('Miller Address:', millerAddress);
      
      try {
        const millerOrders = await contractWithSigner.getAcceptedOrdersByMiller(millerAddress);
        console.log('Miller Orders:', millerOrders);
        setAorders(millerOrders);
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    }
  };

  useEffect(() => {
    if (contract) {
      getPendingOrdersByMiller();
      getAceptedOrdersByMiller();
      getMillerCapacity(millerAddress);
    }
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
        strings: [' Welcome to Miller Dashboard'],
        autoStart: true,
        loop: true,
      }}/>
      </h1>
      
      <h2>Set Target Quantity</h2>
       <form onSubmit={handleSubmit}>
        <label>
           Target Quantity:
           <input type="number" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} />
         </label>
         <button type="submit" disabled={loading}>Set</button>
       </form>
       <div className='capacity-info'>
        <h2>Capacity Information</h2>
          <p>Max Storage Capacity: {millerCapacity.maxStorageCapacity}</p>
          <p>Target Quantity: {millerCapacity.targetQuantity}</p>
          <p>Available Capacity: {millerCapacity.availableCapacity}</p>
      </div>
      <h2>Pending Order List</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Expiry Date</th>
            <th>Quantity</th>
            <th>Order Status</th>
            <th>Farmer Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  {porders.map((order) => {
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
        <td>{order.farmer}</td>
        <td>
          {order.status === 4 && (
            // Show button only when status is IN_TRANSIT
            <button onClick={() => confirmDelivery(order.farmer, order.orderId)}>Confirm Delivery</button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
      <div></div>
      <h2>Accepted Order List</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {/* <th>Date on which Received</th> */}
            <th>Quantity</th>
            <th>Order Status</th>
            <th>Farmer Name</th>
          </tr>
        </thead>
        <tbody>
          {aorders.map(order => (
            <tr key={order.orderId}>
              <td>{new Date(order.dateTime * 1000).toLocaleDateString()}</td>
              {/* <td>{order.receivedDate}</td> */}
              <td>{order.quantity.toString()}</td>
              <td>{statusStrings[order.status]}</td>
              <td>{order.farmer}</td>
            </tr>
          ))}
        </tbody>
      </table>
   
    </div>
  );
};
