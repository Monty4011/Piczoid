import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError.js";
import sharp from "sharp"
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Get file stats
        const fileSizeInBytes = fs.statSync(localFilePath).size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert to MB

        // Read the file into a buffer
        const fileBuffer = fs.readFileSync(localFilePath);

        // Resize the image using sharp, adjusting for file size if necessary
        let transformedBuffer;
        if (fileSizeInMB > 10) {
            // For larger files, resize and reduce quality
            transformedBuffer = await sharp(fileBuffer)
                .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .jpeg({ quality: 60 }) // Reduce quality for large files
                .toBuffer();
        } else {
            // For smaller files, just resize
            transformedBuffer = await sharp(fileBuffer)
                .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toBuffer();
        }

        const response = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) {
                        return reject(error); // Reject the promise if there's an error
                    }
                    resolve(result); // Resolve the promise with the result
                }
            );
            uploadStream.end(transformedBuffer)
        }); // End the stream with the buffer

        // Clean up the local file
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        fs.unlinkSync(localFilePath); // Ensure local file is deleted in case of an error
        return null;
    }
};

const deleteImageFromCloudinary = async (publicIdOfFile) => {
    try {
        const result = await cloudinary.uploader.destroy(publicIdOfFile, { resource_type: "image" });
        if (result.result !== 'ok') {
            throw new ApiError(500, "File could not be deleted from Cloudinary");
        }
    } catch (error) {
        throw new ApiError(500, "Error deleting file from Cloudinary: " + error.message);
    }
}
const deleteVideoFromCloudinary = async (publicIdOfFile) => {
    try {
        const result = await cloudinary.uploader.destroy(publicIdOfFile, { resource_type: "video" });
        if (result.result !== 'ok') {
            throw new ApiError(500, "File could not be deleted from Cloudinary");
        }
    } catch (error) {
        throw new ApiError(500, "Error deleting file from Cloudinary: " + error.message);
    }
};

export { uploadOnCloudinary, deleteImageFromCloudinary, deleteVideoFromCloudinary }