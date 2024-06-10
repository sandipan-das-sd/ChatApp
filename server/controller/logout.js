async function logout(req,res){
    try {

        const cokkieOption={
            http:true,
            secure:true
        }
        return res.cookie('token','',cokkieOption).status(200).json({
            message:"Session out",
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message||error,
            error:true
        })
    }
}
module.exports=logout