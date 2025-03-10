"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import AsyncSelect from "react-select/async";
import { v4 as uuidv4 } from "uuid";
import { getCroppedImg } from "./utils";

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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files![0];

    if (!selectedFile || selectedFile.type != "image/jpeg") {
      return alert("Please upload a JPG file.");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(selectedFile);
  };

  const closeModal = () => {
    setImageSrc(null);
    setIsModalOpen(false);
  };

  const submitForm = async (formData: FormData) => {
    const key = uuidv4();

    formData.append("file", croppedImage as Blob);
    formData.append("key", key);

    const presignedUrl = await getPresignedUrl(key);

    await fetch(presignedUrl, {
      body: croppedImage,
      method: "PUT",
      headers: {
        "Content-Type": ".jpg",
        "Content-Disposition": `attachment; filename="${key}"`,
      },
    });

    try {
      await uploadPicture(formData);
      alert("File uploaded successfully");
      closeModal();
    } catch (error) {
      alert(`Error uploading file ${error}`);
    }
  };

  const onCropComplete = async (_croppedArea, croppedAreaPixels) => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
    setCroppedImage(croppedImage);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <input
        type="file"
        accept=".jpg, .jpeg"
        onChange={handleFileSelection}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 w-full h-full md:w-2/3 md:h-4/5 lg:w-2/3 lg:h-4/5 rounded shadow-lg overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">File Uploaded</h2>
                <span
                  onClick={closeModal}
                  className="cursor-pointer text-xl font-bold text-gray-700 hover:text-green-100"
                >
                  &times;
                </span>
              </div>
              <form
                action={submitForm}
                className="max-w-screen-md mx-auto my-20 bg-slate-100 shadow-md rounded py-8 px-10"
              >
                <div className="relative aspect-square w-full mx-auto">
                  <Cropper
                    image={imageSrc as string}
                    crop={cropPosition}
                    zoom={zoom}
                    aspect={1 / 1}
                    objectFit="contain"
                    onCropChange={setCropPosition}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                <label htmlFor="species" className="block text-gray-700 text-sm my-10 font-bold mb-2">
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
          </div>,
          document.body
        )}
    </div>
  );
}
