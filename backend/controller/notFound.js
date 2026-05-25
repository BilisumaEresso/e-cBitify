const notFound=(req,res,next)=>{
    res.status(404)
    throw new Error("api not found")
}

module.exports=notFound