const Button = ({children,onClick}:{children:React.ReactNode, onClick:()=>void}) => {
  return (
    <div className="">
      <button className="bg-green-400 py-4 px-8 rounded-2xl cursor-pointer" onClick={onClick}>{children}</button>
    </div>
  )
}

export default Button
