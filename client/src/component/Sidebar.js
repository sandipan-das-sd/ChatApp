import React, { useEffect, useState } from 'react';
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaImage, FaUserPlus } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from "../component/Avatar";
import { useDispatch, useSelector } from "react-redux"
import EditUserDetails from './EditUserDetails';
import SearchUser from './SearchUser';
import { FaVideo } from "react-icons/fa"

import { GoArrowUpLeft } from "react-icons/go";
import { logout } from '../redux/userSlice';
import toast from 'react-hot-toast';
import { MdAttachFile } from "react-icons/md";

function Sidebar() {
  const user = useSelector(state => state?.user)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [allUser, SetallUser] = useState([])
  const [opensearchUser, Setopensearch] = useState(false)
  const socketConnection = useSelector(state => state.user?.socketConnection);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // const user = useSelector(state => state?.user);
  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('sidebar', user._id)
      socketConnection.on('conversation', (data) => {
        console.log('conversation', data)
        const conversationUserData = data.map((conversationUser, index) => {
          if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
            return {
              ...conversationUser,
              userDetails: conversationUser?.sender

            }

          }
          else if (conversationUser?.receiver?._id !== user?._id) {
            return {
              ...conversationUser,
              userDetails: conversationUser?.receiver

            }
          }
          else {
            return {
              ...conversationUser,
              userDetails: conversationUser.sender

            }
          }


        })
        SetallUser(conversationUserData)
      })
    }
  }, [socketConnection, user])
  const handelLogout = () => {
    dispatch(logout)
    toast.success("Logged Out Succesfully!!")
    navigate('/email')
    localStorage.clear()
  }

  return (
    <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>
      <div className='bg-slate-100 w-12 h-full rounded-tr-lg py-5 text-slate-600 flex flex-col justify-between'>
        <div className='flex flex-col items-center gap-4'>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive ? 'bg-slate-200' : ''}`
            }
            title='chat'
          >
            <IoChatbubbleEllipsesSharp size={25} />
          </NavLink>
          <div
            onClick={() => Setopensearch(true)}
            to="/user"

            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive ? 'bg-slate-200' : ''}`
            }
            title='add friend'
          >
            <FaUserPlus size={20} />
          </div>
        </div>

        <div className='flex flex-col items-center gap-4'>
          <button className='flex justify-center items-center' title={user.name} onClick={() => {
            setEditUserOpen(true)
          }}>
            <Avatar width={35} height={35}
              name={user.name}
              ImageUrl={user?.profile_pic}
              userId={user._id}
            />

          </button>
          <button
            className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded' onClick={handelLogout}
            title='logout'
          >
            <span className='-ml-2'>
              <CgLogOut size={20} />
            </span>
          </button>
        </div>
      </div>

      <div className='w-full '>
        <div className='h-16 flex items-center'>
          <h2 className='text-xl font-bold p-4 text-slate-800  '> Message</h2>
        </div>
        <div className='bg-slate-200 p-[0.5px] '>
          <div className=' h-[calc(100vh-65px)]  overflow-x-hidden overflow-y-auto    scroolbar ' >
            {
              allUser.length === 0 && (
                <div className='mt-12 sm:mt-20'>
                  <div className='flex justify-center items-center my-4 text-slate-500'>
                    <GoArrowUpLeft
                      size={50}
                    />
                  </div>
                  <p className='text-lg text-center text-slate-600 '> Explore users to start converation</p>
                </div>
              )
            }
            {
              allUser.map((conv, index) => (
                <NavLink to={"/" + conv?.userDetails?._id} key={conv?._id} className='flex items-center py-3 px-2  gap-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer '>
                  <div>
                    <Avatar
                      ImageUrl={conv?.userDetails?.profile_pic}
                      name={conv?.userDetails?.name}
                      width={35}
                      height={35}
                    />
                  </div>
                  <div>
                    <h3 className=' text-ellipsis line-clamp-1 font-semibold text-base  '>{conv?.userDetails?.name}</h3>
                    <div className='text-slate-500 text-xs flex items-center gap-1 '>
                      <div className='flex items-center gap-1'>
                        {
                          conv?.lastMsg?.imageUrl && (
                            <div className='flex items-center gap-1'>
                              <span> <FaImage /></span>

                              {
                                !conv?.lastMsg?.text &&
                                <span>Image</span>
                              }

                            </div>

                          )
                        }

                        {
                          conv?.lastMsg?.videoUrl && (
                            <div className='flex items-center gap-1'>
                              <span> <FaVideo /></span>
                              {
                                !conv?.lastMsg?.text &&
                                <span>Video</span>
                              }
                            </div>

                          )
                        }

                        {
                          conv?.lastMsg?.fileUrl && (
                            <div className='flex items-center gap-1'>
                              <span> <MdAttachFile /></span>
                              {
                                !conv?.lastMsg?.text &&
                                <span>File</span>
                              }
                            </div>

                          )
                        }
                      </div>


                      <p className=' text-ellipsis line-clamp-1'>{conv.lastMsg ? conv.lastMsg.text : ''}</p>

                    </div>



                  </div>
                  {
                    Boolean(conv.unseenMsg) && (
                      <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv.unseenMsg}</p>


                    )

                  }


                </NavLink>

              ))
            }




          </div>
        </div>
      </div>
      {/**Edit user deails */}
      {
        editUserOpen && (
          <EditUserDetails onClose={() => {
            setEditUserOpen(false)
          }}
            user={user}
          />
        )
      }
      {/* Search User*/}
      {
        opensearchUser && (
          <SearchUser onClose={() => Setopensearch(false)} />
        )
      }
    </div>
  );
}

export default Sidebar;