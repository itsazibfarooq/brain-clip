"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [imgUpload, setImgUpload] = useState(false);
  const [webCam, setWebCam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [file, setFile] = useState<File | null>(null);

  // State to store the base64
  const [base64, setBase64] = useState<string | null>(null);

  const handleImageChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const toBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const [emotion, setEmotions] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const base64 = await toBase64(file as File);
    setBase64(base64 as string);

    const payload = JSON.stringify({
      data: [`${base64}`],
    });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    try {
      const response = await fetch(
        "https://schibsted-facial-expression-classifier.hf.space/api/predict",
        {
          method: "POST",
          headers: myHeaders,
          body: payload,
          redirect: "follow",
        }
      );

      if (response.ok) {
        const text = await response.text();
        setEmotions(text);
      } else {
        console.log("Image upload failed", response);
      }
    } catch (error) {
      console.error("Error uploading image", error);
    }
  };

  const handleImgUpload = () => {
    console.log("uplaoding img", imgUpload);
    setWebCam(false);
    setImgUpload(!imgUpload);
  };

  const handleWebCamUpload = () => {
    console.log("uploading webcam", webCam);
    setImgUpload(false);
    setWebCam(!webCam);
  };

  const hanldeStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setStream(localStream);
  };

  useEffect(() => {
    if (webCam) {
      hanldeStream();
    }
  }, [webCam]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const buttonStyles =
    "cursor-pointer group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 mx-auto grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          onClick={handleImgUpload}
          className={buttonStyles}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Upload Image{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Upload Image to detect emotions from
          </p>
        </a>
        <a
          onClick={handleWebCamUpload}
          className={buttonStyles}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            WebCam{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Use Real Time webcam to detect emotions
          </p>
        </a>
      </div>

      <div>
        {imgUpload && (
          <div>
            <h1>Image Upload</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <button
                type="submit"
                className="p-4 bg-slate-600 rounded-2xl hover:bg-slate-700"
              >
                Upload Image
              </button>
            </form>
            {file && (
              <div>
                <h2>Selected Image Preview:</h2>
                <img
                  height={400}
                  width={300}
                  src={URL.createObjectURL(file)}
                  alt="Selected"
                />
              </div>
            )}
          </div>
        )}
        {webCam && (
          <div>
            {stream ? (
              <video ref={videoRef} autoPlay playsInline></video>
            ) : (
              <p>Initializing webcam...</p>
            )}
          </div>
        )}
      </div>

      {emotion && <div>{emotion}</div>}
    </main>
  );
}
