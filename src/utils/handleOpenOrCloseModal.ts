export const handleOpenOrCloseModal=(modalName:string,shouldOpen:boolean)=>{
    const dialog = document.getElementById(modalName);
    if (dialog instanceof HTMLDialogElement) {
        if(shouldOpen) dialog.showModal();
        else dialog.close()
    }
}