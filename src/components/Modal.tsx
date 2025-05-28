import React, { ReactNode } from 'react'

const Modal = ({children , modalName}:{children:ReactNode, modalName:string}) => {
  return (
    <div>
        <dialog id={modalName} className="modal">
        <div className="modal-box max-w-sm">
            {children}
            <div className="modal-action">
            {/* <form method="dialog">
                <button className="btn">Close</button>
            </form> */}
            </div>
        </div>
        </dialog>
    </div>
  )
}

export default Modal
