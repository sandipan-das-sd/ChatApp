import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Avatar from './Avatar';
import uploadFiles from '../helpers/uploadFiles';
import toast from 'react-hot-toast';
import DividerComponent from './DividerComponent';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user.name || '',
    profile_pic: user.profile_pic || '', // Set default profile pic URL
  });
  const [loading, setLoading] = useState(false); // State for loading status
  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...user,
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true); // Set loading to true when form is submitted
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;
      const token = user.token;
      const response = await axios.post(URL, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response?.data?.message);
      if (response.data.success) {
        dispatch(setUser(data)); // Update Redux state with updated user data
      }
      onClose(); // Close the modal after successful submission
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Error updating user details'
      );
    } finally {
      setLoading(false); // Set loading to false when request is completed
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    setLoading(true); // Set loading to true while photo is uploading
    try {
      const uploadResponse = await uploadFiles(file);
      setData((prev) => ({
        ...prev,
        profile_pic: uploadResponse.secure_url,
      }));
      toast.success('Profile Photo uploaded successfully');
    } catch (error) {
      toast.error('Error uploading photo');
    } finally {
      setLoading(false); // Set loading to false when photo upload is completed
    }
  };

  const handleOpenUploadPhoto = () => {
    uploadPhotoRef.current.click();
  };

  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center'>
      <div className='bg-white p-4 py-6 m-1 rounded w-full max-w-sm'>
        <h1 className='font-semibold'>Profile Details</h1>
        <p className='text-sm'>Edit user details</p>
        <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name' className='block text-gray-700'>
              Name:
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={data.name}
              onChange={handleOnChange}
              className='w-full py-1 px-2 focus:outline-primary border border-0.5'
            />
          </div>
          <div className='mb-4'>
            <div>Photo</div>
            <div className='my-1 flex items-center gap-4'>
              <Avatar
                width={40}
                height={40}
                ImageUrl={data.profile_pic}
                name={data?.name}
              />
              <label htmlFor='profile_pic' className='block text-gray-700'>
                <button
                  type='button'
                  className='font-semibold'
                  onClick={handleOpenUploadPhoto}
                >
                  Change Photo
                </button>
                <input
                  type='file'
                  className='hidden'
                  id='profile_pic'
                  ref={uploadPhotoRef}
                  onChange={handleUploadPhoto}
                />
              </label>
            </div>
          </div>
          <DividerComponent />
          <div className='flex gap-2 ml-auto'>
            <button
              type='button'
              className='border border-primary px-4 py-1 rounded text-primary hover:bg-primary hover:text-white'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='border border-primary px-4 py-1 bg-primary text-white rounded hover:bg-secondary'
              disabled={loading} // Disable the button while loading
            >
              {loading ? 'Loading...' : 'Save'} {/* Display loading text if loading */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserDetails;
