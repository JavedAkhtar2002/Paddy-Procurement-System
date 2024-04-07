import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { backend } from '../config.js'; // Assuming you have a backend configuration file

export const Update = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(`${backend}/forgot-password`, {
                email,
                password,
            });
            toast.success(response.data.message);
            history.push('/login'); // Redirect to login page after password reset
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error("Error updating password. Please try again.");
        }
    };

    return (
        <div className="registration-page">
            <h2 className="head">Update Password</h2>
            <div className='form-outer-div'>
            <form  className="regd-form1" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>New Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Confirm Password:</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div className='submit'>
                <button  type="submit">Update Password</button>
                </div>
            </form>
            </div>
        </div>
    );
};