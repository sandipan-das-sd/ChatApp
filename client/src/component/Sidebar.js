import React, { useState } from 'react';
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { NavLink } from 'react-router-dom';
import Avatar from "../component/Avatar";
import {useSelector} from "react-redux"
import EditUserDetails from './EditUserDetails';
import SearchUser from './SearchUser';
import { GoArrowUpLeft } from "react-icons/go";
function Sidebar() {
  const user=useSelector(state=>state?.user)
  const [editUserOpen,setEditUserOpen]=useState(false)
  const[allUser,SetallUser]=useState([])
  const[opensearchUser,Setopensearch]=useState(false)
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
          onClick={()=>Setopensearch(true)}
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
          <button className='flex justify-center items-center' title={user.name} onClick={()=>{
            setEditUserOpen(true)
          }}>
            <Avatar width={35} height={35}
            name={user.name}
            ImageUrl={user?.profile_pic}
            userId={user._id}
            />

          </button>
          <button 
            className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
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
              allUser.length===0 &&(
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
          </div>
          </div>
      </div>
        {/**Edit user deails */}
        {
          editUserOpen &&(
            <EditUserDetails onClose={()=>{
              setEditUserOpen(false)
            }}
            user={user}
            />
          )
        }
      {/* Search User*/}
      {
        opensearchUser&&(
          <SearchUser onClose={()=>Setopensearch(false)}/>
        )
      }
    </div>
  );
}

export default Sidebar;