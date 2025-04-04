import TextField from '@mui/material/TextField';

interface Prop{
    type:string;
    value:string;
    onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;
    placeholder:string;
    label:string;
}

const Input = ({type,value,onChange,placeholder,label}:Prop) => {
  return (
    <div className="m-2">
        <TextField sx={{input: { color: "white" }}} fullWidth type={type} value={value} onChange={onChange} placeholder={placeholder} label={label} color="primary" focused />
    </div>
  )
}

export default Input
