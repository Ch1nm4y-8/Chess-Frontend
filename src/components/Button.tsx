import React from "react"

const Button = ({children,onClick,color}:{children:React.ReactNode, onClick:()=>void,color:string}) => {
  return (
    <div className="flex">
      <button style={{ backgroundColor: color }} className={`py-2 flex-1 px-8 rounded-sm cursor-pointer`} onClick={onClick}>{children}</button>
    </div>
  )
}

export default Button
