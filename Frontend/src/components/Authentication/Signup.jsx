
import React,{useState} from 'react'
import axios from 'axios';
import { useCustomToast } from '../Miscellaneous/Toast';

 
const Signup = () => {

  const { showToast } = useCustomToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pic, setPic] = useState('');
  const [show,setShow] = useState(false);
  const [loading,setLoading] = useState(false);


  const handleToggle = () => {
    setShow(!show);
  }


  const submitHandler = async (e) => { 
    e.preventDefault();
    if(password !== confirmPassword){
      ('Password does not match');
      showToast({
        title: "Error Occurred!",
        description: "Password does not match",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    setLoading(true);
    const response = await axios.post('http://localhost:3000/api/users', {
      name,
      email,
      password,
      pic
    },{withCredentials:true,validateStatus:false});
    console.log(response);
    if(response.status >= 200 && response.status < 300){
      showToast({
        title: "Error Occurred!",
        description: "User registered successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      localStorage.setItem('user', JSON.stringify(response.data));
    navigate('/home');
    setLoading(false);
   }else{
      showToast({
        title: "Error Occurred!",
        description: "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
   }
  }
  return (
  <form className='Signup-form'>
    <div className='Signup-form-Name'>
      <label>Name</label>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
    </div>
    <div className='Signup-form-Email'>
      <label>Email</label>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
    </div>
    <div className='Signup-form-Password'>
      <label>Password</label>
      <input 
        type={show?"text":"password"}
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
    </div>
    <div className='Signup-form-ShowPassword'>
      <button onClick={handleToggle}>{show?"Hide":"Show"} password</button>
    </div>
    <div className='Signup-form-ConfirmPassword'>
      <label>Confirm Password</label>
      <input 
        type={show?"text":"password"}
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
      />
    </div>
    <div className='Signup-form-Pic'>
      <label>Profile Picture</label>
      <input 
        type="file" 
        onChange={(e) => setPic(e.target.files[0])} 
      />
    </div>
    <button onClick={submitHandler}>Sign Up</button>
    {/* <button type="submit">Sign Up</button> */}
  </form>
  )
}

export default Signup;