import React from 'react'
import { motion } from 'framer-motion';

const ChessLoader = () => {
  return (
    <motion.div
      animate={{rotate: [0, 180,180,360,360] , x: [0, 0,200,200,0],    }}
      transition={{
        duration: 4,
        times: [0, 0.25, 0.5, 0.75, 1],
        repeat: Infinity,
        repeatType: 'loop', // could also use 'mirror' or 'reverse'
        ease: 'easeInOut'
      }}
        className='w-[8vw]'>
      <img src="/assets/chessLoader.png" alt="" />
    </motion.div>
  )
}

export default ChessLoader

