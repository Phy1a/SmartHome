import React, { useState } from 'react'
import './App.css'

function App() {
  const [tempX,setTempX] = useState(0);
  const [x, setX] = useState(0)





  function handleSubmit(e :React.SubmitEvent<HTMLFormElement>){
    e.preventDefault();

  }

  function handleClick(e : number){

    if(typeof e === 'number'){
      setX(e);
    }
    else console.error("failed");
  }

  return (
    <>
      <form onSubmit={(e)=>handleSubmit(e)}>
        <input type='number' id='x' name='x' value={tempX} onChange={(e)=>setTempX(Number(e.target.value))}></input>
        <button type='submit' onClick={()=>handleClick(tempX)}>Submit</button>
        <p>{x}</p>

      </form>
    </>
  )
}


export default App
