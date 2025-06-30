import React from "react";

const Timer = React.memo(function Timer({ time }:{time:string}) {
              return <div className="bg-white text-black text-3xl m-2 ">{time}</div>     
;
});

export default Timer

