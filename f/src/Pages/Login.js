import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Typewriter from "typewriter-effect";
import { TrackingContext } from "../Context/TrackingContext.js";
export const Login = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const navigate=useNavigate();
    const {setName,setUser}=useContext(TrackingContext);
    const token =sessionStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
            if(!emailOrPhone || !password || !role){
                toast.success("All Fields Are Required!");
              } else{
                try {
                    // Send login credentials to backend
            const response = await axios.post("http://localhost:5500/api/v1/user/login", {
                role,    
                emailOrPhone,
                password,
            });
            sessionStorage.setItem("token", response.data.accessToken);
            setName("LogOut");
            setUser(response.data); // Set user details in context
            navigate(`/read/${role}`); // Redirect to role-specific route
        }    
        catch (error) {
            console.error('Error logging in:', error);
        }
    }
};

useEffect(()=>{
    if(token) 
    navigate("/read");
    // eslint-disable-next-line
  },[token,navigate]);

    return (
        <div className='registration-page'>
            <h1 className='registration-title'>
            <Typewriter
       options={{
        strings: [' Login to the System'],
        autoStart: true,
        loop: true,
      }}/>
      </h1>
            
            <div className='form-outer-div'>
            <form className="regd-form" onSubmit={handleSubmit}>
            
            <div className='select-role'>
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="">Select Role</option>
                        <option value="fci">FCI</option>
                        <option value="farmer">Farmer</option>
                        <option value="miller">Miller</option>
                    </select>
                </div>
                <div className='input-field'>
                    <label>Email/Phone:</label>
                    <input type="text" name='Email/Phone' placeholder='Enter Email/Phone' value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
                </div>
                <div className='input-field'>
                    <label>Password:</label>
                    <input type="password" name='Password' placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <div className='submit'>
                <button type="submit">Login</button>
                <Link to="/" className=" back"> 
                    Back 
                </Link>
                <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                </Link>
                </div>
                  
             </form>
             </div>
        </div>
    );
};
