import React from 'react'

interface OAuthButtonProps{
    children:React.ReactNode;
    onClick:()=>void;
    imagePath:string;
}

const OAuthButton = ({children,onClick,imagePath}:OAuthButtonProps) => {
  return (
    <div>
        <button onClick={onClick} className='flex bg-white text-black rounded-xl items-center gap-3 px-5 py-2 cursor-pointer '>
        <img src={imagePath} alt="" className='w-8 bg-white' />
        {children}
        </button>
    </div>
  )
}

export default OAuthButton
