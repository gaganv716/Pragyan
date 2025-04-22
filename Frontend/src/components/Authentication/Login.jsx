import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../Context/chatProvider';
import { useCustomToast } from '../Miscellaneous/Toast';

const Login = () => {
  const { showToast } = useCustomToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false); 
  const { setUser } = ChatState();
  const handleSubmit = async (e) => {
    console.log("looging: ",e);
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    setLoading(true);
    const response = await axios.post('http://localhost:3000/api/users/login', {
      email,
      password
    },{withCredentials:true,validateStatus:false});

  console.log(response);
  if(response.status >= 200 && response.status < 300){
    showToast({
      title: "Success!",
      description: "User logged in successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-left",
    });
    setUser(response.data);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    navigate('/chats');
  }
    else{
      showToast({
        title: "Error Occurred!",
        description: "Something went wrong! could not log in",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } 
    setLoading(false); 
  };

  const getCred = async () => { 
    setEmail("guestuser@example.com");
    setPassword("guestuser");
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type={show?"text":"password"}
              className="form-input password-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className='show' type='button' onClick={()=>{
              setShow(!show);
            }}>{show?"Hide":"Show"}</button>
          </div>
         
          <button type='submit'>Login</button>
          <br /><br />
      
          <button onClick={getCred}></button>
          {/* <button type="submit" className="login-button">Login</button> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
