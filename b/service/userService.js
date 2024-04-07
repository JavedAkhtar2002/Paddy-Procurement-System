import { Farmer,Miller,FCI } from '../model/userModel.js';
import jwt from "jsonwebtoken"

export const registerUser = async (req, res) => {
  const { name, phone, email, password, address, role, maxStorageCapacity } = req.body;
  try {
    let UserModel;
    switch (role) {
      case "farmer":
        UserModel = Farmer;
        break;
      case "miller":
        UserModel = Miller;
        break;
      case "fci":
        UserModel = FCI;
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // const result=await UserModel.findOne({address});

    const result = await UserModel.findOne({
      $and: [
        { email: email }, 
        { phone: phone }, 
        { address: address }
      ]
    });    

    if(result)
    res.status(200).json({message:"User Already Exists, Try Login"});
    else{
      const newUser={
        name,
        phone,
        email,
        password,
        address,
        role,
    };

    if (role === "miller") {
      if (!maxStorageCapacity) {
        return res.status(400).json({ message: "Max storage capacity is required for Miller" });
      }
      newUser.maxStorageCapacity = maxStorageCapacity;
    }

    const createUser = await UserModel.create(newUser);
    await createUser.save();
    res.status(201).json({ message: 'User registered successfully' , user: createUser});
  }  
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req, res) => {
  const { role, emailOrPhone, password } = req.body;
  if(!role || !emailOrPhone || !password)
  res.status(404).json({message:"Role, Email/Phone Number and Password are Compulsory"})
  else
  {
    try {
      let user;
      const isPhoneNumber=/^\d{10}$/.test(emailOrPhone);

      let UserModel;
    switch (role) {
      case "farmer":
        UserModel = Farmer;
        break;
      case "miller":
        UserModel = Miller;
        break;
      case "fci":
        UserModel = FCI;
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }
    if (isPhoneNumber) {
      user = await UserModel.findOne({ phone: emailOrPhone });
    } else {
      user = await UserModel.findOne({ email: emailOrPhone });
    }
  if(user && password===user.password)
  {
      const accessToken=jwt.sign(
          //payload
          {
          user:{
              id:user._id,
              name:user.name,
              phone: user.phone,
              email:user.email,
              password:user.password,
              address:user.address,
              role:user.role,
              maxStorageCapacity: user.maxStorageCapacity,
          }
      },
      //secretKey
      process.env.ACCESS_TOKEN_SECRET,
      //options
      {
          expiresIn: "1h"
      }
      );
      res.status(200).json({accessToken})
  }
  else
      res.status(404).json({message:"Invalid credentials!"})
    } catch (error) {
      console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find();
    if(farmers.length!=0)
    res.status(200).json(farmers);
    else
    res.status(404).json({message:"No record found"});
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMillers = async (req, res) => {
  try {
    const millers = await Miller.find();
    if(millers.length!=0)
    res.status(200).json(millers);
    else
    res.status(404).json({message:"No record found"});
  } catch (error) {
    console.error('Error fetching millers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

