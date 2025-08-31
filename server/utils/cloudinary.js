const cloudinary = require('cloudinary').v2;
const fs = require('fs') 
const dotenv = require('dotenv')
dotenv.config({path : "./.env"})


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:  process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });


   const fileupload = async (Filepath) => { try {
    if(!Filepath) return null

   const response = await cloudinary.uploader.upload(Filepath , {
        resource_type : "auto"
    })
     fs.unlinkSync(Filepath)
    // console.log("File uploaded successfully" , response.url)
    
    // console.log(response);
    return response;
  
   } catch (error) {
   fs.unlinkSync(Filepath)
   console.error('Cloudinary upload error:', error);
  throw new Error(`Cloudinary upload failed: ${error.message}`)
   }
   }  
 
module.exports = fileupload