"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import AsyncSelect from "react-select/async";
import { v4 as uuidv4 } from "uuid";
import { createImage, getCroppedImg } from "./utils";

async function promiseOptions(inputValue: string): Promise<Record<string, string>[]> {
  if (inputValue.length < 3) {
    return [];
  }

  const searchParams = new URLSearchParams({
    locale: "en_US",
    cat: "species",
    key: process.env.NEXT_PUBLIC_EBIRD_KEY,
    q: inputValue,
  } as Record<string, string>);

  const response = await fetch("https://api.ebird.org/v2/ref/taxon/find?" + searchParams);
  const data = await response.json();

  return data.map((species: Record<string, string>) => ({ value: species.name, label: species.name }));
}

export default function FileDrop({ uploadPicture, getPresignedUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>(""); // Data URL of the original image
  const [thumbnailImage, setThumbnailImage] = useState<string>(""); // Data URL of the cropped image
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const uploadImagetoBucket = async (imageUrl: string, key: string): Promise<string> => {
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    const presignedUrl = await getPresignedUrl(key);

    await fetch(presignedUrl, {
      method: "PUT",
      body: imageBlob,
      headers: {
        "Content-Type": "image/jpg",
        "Content-Disposition": `attachment; filename="${key}"`,
      },
    });

    return presignedUrl;
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files![0];

    if (!selectedFile || selectedFile.type != "image/jpeg") {
      return alert("Please upload a JPG file.");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const closeModal = () => {
    setOriginalImage("");
    setIsModalOpen(false);
  };

  const submitForm = async (formData: FormData) => {
    const key = uuidv4();
    formData.append("key", key);

    const [originalMeta, thumbnailMeta] = await Promise.all([createImage(originalImage), createImage(thumbnailImage)]);

    formData.append("originalWidth", originalMeta.naturalWidth.toString());
    formData.append("originalHeight", originalMeta.naturalHeight.toString());
    formData.append("thumbnailWidth", thumbnailMeta.naturalWidth.toString());
    formData.append("thumbnailHeight", thumbnailMeta.naturalHeight.toString());
    formData.append("cropPosition", JSON.stringify(cropPosition));

    const [originalImagePresignedUrl, croppedImagePresignedUrl] = await Promise.all([
      uploadImagetoBucket(originalImage, key),
      uploadImagetoBucket(thumbnailImage, `${key}-thumbnail`),
    ]);

    console.log("Uploading original image to:", originalImagePresignedUrl);
    console.log("Uploading cropped image to:", croppedImagePresignedUrl);

    try {
      await uploadPicture(formData);
      alert("File uploaded successfully");
      closeModal();
    } catch (error) {
      alert(`Error uploading file ${error}`);
    }
  };

  const onCropComplete = async (_croppedArea, croppedAreaPixels) => {
    console.debug("Cropped area:", _croppedArea);
    console.debug("Cropped area pixels:", croppedAreaPixels);
    console.debug("Crop position:", cropPosition);

    const croppedImage = await getCroppedImg(originalImage, croppedAreaPixels, 0);
    setThumbnailImage(croppedImage);
  };

  return (
    <div className="flex items-center justify-center w-full h-[80vh] mt-5">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">(JPG only)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept=".jpg, .jpeg" onChange={handleFileSelection} />
      </label>
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 w-full h-full md:w-3/4 md:h-4/5 lg:w-3/5 lg:h-5/6 rounded shadow-lg">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">File Uploaded</h2>
                <span
                  onClick={closeModal}
                  className="cursor-pointer text-xl font-bold text-gray-700 hover:text-green-100"
                >
                  &times;
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full h-full aspect-square">
                  <Cropper
                    image={originalImage as string}
                    crop={cropPosition}
                    zoom={zoom}
                    aspect={1 / 1}
                    objectFit="contain"
                    onCropChange={setCropPosition}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <form
                  action={submitForm}
                  className="w-full lg:w-1/2 md:w-1/2 flex flex-col bg-slate-100 shadow-md rounded py-8 px-6"
                >
                  <label htmlFor="species" className="block text-gray-700 text-sm font-bold mb-2">
                    Species
                  </label>
                  <AsyncSelect
                    classNames={{
                      control: () => "w-full py-1 px-2 mb-4 text-gray-700 focus:outline-none focus:shadow-outline",
                    }}
                    name="species"
                    cacheOptions
                    loadOptions={promiseOptions}
                    isClearable={true}
                  />

                  <input
                    type="submit"
                    className="mt-5 shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                    value="Submit"
                  />
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
