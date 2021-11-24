import React from 'react'
import Uploady from "@rpldy/uploady";
import UploadDropZone from "@rpldy/upload-drop-zone";
import './Home.styles.scss'
import {Link} from "react-router-dom";
import FileUpload from "../FileUpload/FileUpload";

const Home = () => {
    return (
        <>

            <main className="px-4 py-16 min-h-screen bg-gray-100">

                <section className="w-full max-w-7xl mx-auto">
                    <FileUpload />

                </section>
            </main>
        </>
    )
}

export default Home
