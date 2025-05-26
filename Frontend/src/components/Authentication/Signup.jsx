import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomToast } from '../Miscellaneous/Toast';

const Signup = () => {
  const { showToast } = useCustomToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pic, setPic] = useState(null);
  const [picUrl, setPicUrl] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const Backend = import.meta.env.VITE_BACKEND_URL;
  const Cloudinary = import.meta.env.VITE_CLOUDINARY_URL ;

  const handleToggle = (e) => {
    e.preventDefault();
    setShow((prev) => !prev);
  };

  const handleImageUpload = async () => {
    if (!pic) return null;

    if (
      pic.type !== 'image/jpeg' &&
      pic.type !== 'image/png' &&
      pic.type !== 'image/jpg'
    ) {
      showToast({
        title: 'Invalid Image!',
        description: 'Please select a valid image (jpg/png)',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return null;
    }

    const formData = new FormData();
    formData.append('file', pic);
    formData.append('upload_preset', 'Chat_App');
    formData.append('cloud_name', 'djqdchjjo');

    try {
      const res = await fetch(`${Cloudinary}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.url.toString();
    } catch (err) {
      showToast({
        title: 'Upload Failed',
        description: 'Something went wrong while uploading the image',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return null;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }

    if (!pic) {
      showToast({
        title: 'Profile Picture Missing',
        description: 'Please select a profile picture',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }

    setLoading(true);
    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${Backend}/api/users`,
        {
          name,
          email,
          password,
          pic: imageUrl,
        },
        {
          withCredentials: true,
          validateStatus: false,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        showToast({
          title: 'Success!',
          description: 'User registered successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-left',
        });
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/home');
      } else {
        showToast({
          title: 'Registration Failed',
          description: response.data?.message || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-left',
        });
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
    }

    setLoading(false);
  };

  return (
    <form className="Signup-form" onSubmit={submitHandler}>
      <div className="Signup-form-Name">
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="Signup-form-Email">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="Signup-form-Password">
        <label>Password</label>
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="Signup-form-ShowPassword">
        <button onClick={handleToggle}>{show ? 'Hide' : 'Show'} password</button>
      </div>
      <div className="Signup-form-ConfirmPassword">
        <label>Confirm Password</label>
        <input
          type={show ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="Signup-form-Pic">
        <label>Profile Picture</label>
        <input type="file" accept="image/*" onChange={(e) => setPic(e.target.files[0])} />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Signup;
