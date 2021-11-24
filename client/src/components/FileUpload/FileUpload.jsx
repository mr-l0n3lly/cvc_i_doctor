import React, { useEffect, useMemo, useState } from 'react'

import Uploady, { UPLOADER_EVENTS } from '@rpldy/uploady'
import { asUploadButton } from "@rpldy/upload-button";
import tenor from '../../assets/tenor.gif';
import Select from 'react-select';

import {ENV} from '../../env'

import UploadProgress from './UploadProgress'

const DivUploadButton = asUploadButton((props) => {
    return <div {...props} style={{ cursor: "pointer" }}>
        Încarcă
    </div>
});

const FileUpload = () => {
    const [response, setResponse] = useState({ staus: undefined, data: undefined })
    const [loading, setLoading] = useState(false);
    const [predLoading, setPredLoading] = useState(false);
    const [predResponse, setPredResponse] = useState(null);
    
    const options = [
        { value: 'covid', label: 'Covid19 / Pneumonia' },
        { value: 'brain', label: 'Brain Tumor' },
        { value: 'anemia', label: 'Anemia' }
      ]

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.ITEM_FINISH]: (item) => {
            setResponse(item.uploadResponse.data)
            setLoading(false);
        },
        [UPLOADER_EVENTS.ITEM_START]: (item) => {
            setLoading(true);
        },
    }), [])

    const handleSelectChange = (e) => {
        const category = e.value
        const filename = response.data.filename;

        setPredLoading(true);

        fetch(`http://${ENV.API_HOST}/api/predict?category=${category}&filename=${filename}`, {
            method: 'GET',
        })
        .then(res => res.json())
        .then((result) => {
            setPredLoading(false);
            setPredResponse(result);
        })
    }

    useEffect(() => {}, [response])

    return (
        <Uploady
            listeners={listeners}
            clearPendingOnAdd
            destination={{
                url: `http://${ENV.API_HOST}/api/image/upload`,
            }}
            accept=".png,.jpg,.jpeg"
        >
            <div className="bg-white rounded-lg px-4 py-10 sm:px-12 lg:px-24 mt-3">
                <strong className="text-lg md:text-xl font-bold">Încarcă fișier</strong>
                <label
                    className="block relative mt-8 border border-dashed border-gray-400 rounded-lg relative overflow-hidden hover:border-gray-700 transition duration-300 ease-in-out">
                    <div className="p-5 flex flex-col items-center justify-center">
                        <DivUploadButton className="rounded-md bg-gray-300 py-3 px-8 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out text-lg font-bold text-gray-600 mt-5"  />
                    </div>
                </label>
            </div>

            <div className="bg-white rounded-lg px-4 py-10 sm:px-12 lg:px-24 mt-8 flex flex-col items-center justify-center">
                <div className="rounded-full bg-gray-200 overflow-hidden mt-4 mb-4">
                    <UploadProgress className="h-3 bg-green-400 rounded-full"/>
                </div>
                { loading && <img src={tenor} />}
                {
                    response.status === "Success" && response.status !== undefined ? (
                        <>
                            {/*<div className={`"rounded-full rounded ${response[0] === 'Success' ? 'bg-green-500' : 'bg-red-500'}  h-24 w-24 p-10 flex flex-col items-center justify-center color-white"`}>{ response[0] === 'Success' ? `Success!` : `Eroare!`}</div>*/}
                                <div className={`w-20 h-20 mx-auto p-2 ${response.status === 'Success' ? 'bg-green-400' : 'bg-red-400'} text-white rounded-full mt-2 mb-6 flex align-middle`}>
                                    {
                                        response.status === 'Success' && response !== undefined ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )
                                    }

                                </div>

                            {
                                response.status === 'Success' ? (
                                    <>
                                        <h1>Poza incarcata cu success, acum alegeti categoria de prezicere</h1>
                                        <Select onChange={handleSelectChange} className="w-100 mt-6" options={options} />
                                        { predLoading && <img src={tenor} /> }
                                        { predResponse ? <h1 className="mt-8">{predResponse.response}</h1> : null }
                                    </>

                                ): (
                                    <h1>Eroare la incarcare!</h1>
                                )
                            }
                        </>
                    ) : null
                }

            </div>

        </Uploady>
    )
}

export default FileUpload
