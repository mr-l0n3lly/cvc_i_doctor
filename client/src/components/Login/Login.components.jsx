import React, {useState} from 'react'
import PropTypes from 'prop-types'

import {ENV} from '../../env'

import '../../App.scss'
import './Login.styless.scss'

async function loginUser(credentials) {
    try {
        let response = await fetch(`http://${ENV.API_HOST}/api/v1/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })

        if (response.status === 200) {
            return response.json()
        } else {
            return null
        }
    } catch (e) {
        console.log(e)
    }

}

const Login = ({setUser}) => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [error, setError] = useState()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const user = await loginUser({
            username,
            password
        })

        if (!user) {
            setError('Wrong username or password')
        } else {
            setUser(user)
        }

    }

    return (
        <>
            <main
                className="px-4 py-6 min-h-screen sm:flex sm:items-center bg-gradient-to-r from-blue-600 to-green-400">
                <section
                    className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-2xl px-6 py-12 sm:px-16 sm:py-20 lg:px-32 lg:py-40">
                    <div className="flex flex-wrap items-center -mx-3">
                        <div className="w-full md:w-1/2 px-3">

                            <img className="w-full max-w-sm block mx-auto" src="login.png" alt="" title=""/>

                        </div>
                        <div className="w-full md:w-1/2 px-3 mt-9 md:mt-0">

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">MOOREDATA</h1>

                            <form onSubmit={handleSubmit}>
                                <div className="mt-9 relative">
                                    <span
                                        className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                        type="text"
                                        name=""
                                        placeholder="Nume utilizator"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="mt-9 relative">
                                    <span
                                        className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                        type="password"
                                        name=""
                                        placeholder="Parola"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />


                                </div>
                                {
                                    error ? <p className="mt-3 text-red-500 text-xs italic">{error}</p> : null
                                }
                                <div className="mt-9">
                                    <button
                                        className="w-full text-center py-3 px-6 rounded-full text-white bg-green-400 hover:bg-blue-600 transition duration-300 ease-in-out">Autentificare
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </section>

            </main>
        </>

    )
}

Login.propTypes = {
    setUser: PropTypes.func.isRequired
}

export default Login
