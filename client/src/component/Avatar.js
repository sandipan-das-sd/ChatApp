import React from 'react';
import { LuUserCircle2 } from 'react-icons/lu';
import { useSelector } from "react-redux"
function Avatar({ userId, name, ImageUrl, width, height }) {
    let avatarName = "";
    const onlineUser = useSelector(state => state?.user?.onlineUser)
    if (name) {
        const splitName = name.split(" ");
        if (splitName.length > 1) {
            avatarName = splitName[0][0] + splitName[1][0];
        } else {
            avatarName = splitName[0][0];
        }
    }

    const bgColor = [
        'bg-slate-200',
        'bg-teal-200',
        'bg-red-200',
        'bg-green-200',
        'bg-yellow-200'
    ];

    const randomIndex = Math.floor(Math.random() * bgColor.length);
    const selectedBgColor = bgColor[randomIndex];
    const isOnline = onlineUser.includes(userId)
    return (
        <div
            className="text-slate-800 rounded-full font-bold flex items-center justify-center relative"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {ImageUrl ? (
                <img
                    src={ImageUrl}
                    alt={name}
                    className="rounded-full"
                    style={{ width: `${width}px`, height: `${height}px` }}
                />
            ) : (
                name ? (
                    <div
                        className={`overflow-hidden flex items-center justify-center rounded-full text-lg ${selectedBgColor}`}
                        style={{ width: `${width}px`, height: `${height}px` }}
                    >
                        {avatarName}
                    </div>
                ) : (
                    <LuUserCircle2 size={Math.min(width, height)} />
                )
            )}
            {
                isOnline && (
                    <div className='bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
                )
            }

        </div>
    );
}

export default Avatar;
