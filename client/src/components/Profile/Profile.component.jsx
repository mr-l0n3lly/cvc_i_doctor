import React, {useEffect, useState} from 'react'

import './Profile.styles.scss'
import {Link} from "react-router-dom";
import useUser from "../App/useUser";

import {ENV} from '../../env'

async function loginUser(credentials) {
    try {
        let response = await fetch(`http://${ENV.API_HOST}/api/v1/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': credentials.user.token
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                role: credentials.role,
                company: credentials.company,
                userEmail: credentials.userEmail
            })
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

async function newPassword(credentials) {
    try {
        let response = await fetch(`http://${ENV.API_HOST}/api/v1/users/newPwd`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': credentials.user.token
            },
            body: JSON.stringify({
                id: credentials.user.user.id,
                username: credentials.user.user.username,
                oldPassword: credentials.oldPassword,
                newPassword: credentials.newPassword
            })
        })

        return response.json()

        // if (response.status === 200) {
        //     return response.json()
        // } else {
        //     return null
        // }
    } catch (e) {
        console.log('Error', e)
    }
}

const Profile = () => {
    const {user, setUser} = useUser()
    const [message, setMessage] = useState()
    const [loaded, setLoaded] = useState()
    const [companies, setCompanies] = useState()
    const [stats, setStats] = useState()
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        lastName: '',
        firstName: '',
        userEmail: '',
        role: 'User',
        company: '--Numele companie--'
    })

    const [oldPwd, setOldPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')

    const [error, setError] = useState()
    const [errorNew, setErrorNew] = useState()

    const handleSelect = (e) => {
        if (!e.target.value.includes('Nume')) {
            setError('')
            setCredentials({
                ...credentials,
                company: e.target.value
            })
        } else {
            setError('Pentru a creea un utilizator este nevoie de a fi selectata o companie')
        }
    }

    const checkPass = (password, setter) => {
        if (password.length < 8) {
            return 'Parola mai mica de 8 caractere'
        } else {

            let regExp = /[A-Z]/

            if (!regExp.test(password)) {
                return 'Parola nu contine litere mari'
            } else {
                regExp = /[0-9]/

                if (!regExp.test(password)) {
                    return 'Parola nu contine cifre'
                }
            }
        }

        return false
    }

    const handleInput = (e) => {
        // eslint-disable-next-line default-case
        switch (e.target.name) {
            case 'username':
                setCredentials((prev) => {
                    return {
                        ...prev,
                        username: e.target.value
                    }
                })
                break
            case 'password':
                setCredentials((prev) => {
                    return {
                        ...prev,
                        password: e.target.value
                    }
                })
                break
            case 'firstName':
                setCredentials((prev) => {
                    return {
                        ...prev,
                        firstName: e.target.value
                    }
                })
                break
            case 'lastName':
                setCredentials((prev) => {
                    return {
                        ...prev,
                        lastName: e.target.value
                    }
                })
                break
            case 'userEmail':
                let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

                if (!re.test(e.target.value)) {
                    setError('Email format incorect')
                } else {
                    setError('')
                }

                setCredentials((prev) => {
                    return {
                        ...prev,
                        userEmail: e.target.value
                    }
                })
                break
        }

        if (e.target.name === 'password') {
            setError(checkPass(e.target.value, setError))
        }
    }

    useEffect(() => {
        fetch(`http://${ENV.API_HOST}/api/v1/users/company`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': user.token
            }
        }).then(response => response.json())
            .then(json => {
                setCompanies(json)
            })
    }, [loaded, user.token])

    useEffect(() => {
        fetch(`http://${ENV.API_HOST}/api/v1/users/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': user.token
            }
        }).then(response => response.json()).then(json => setStats(json))
    }, [loaded, user.token])

    const updatePassword = async (e) => {
        e.preventDefault()

        if (!oldPwd) {
            setErrorNew('Parola veche nu este setata')
            return
        }

        if (oldPwd === newPwd) {
            setErrorNew('Parola noua nu poate fi parola veche')
            return
        }

        if (newPwd !== confirmPwd) {
            setErrorNew('Parola nouă nu coincide cu parola nouă repetată')
        } else {
            let error = checkPass(newPwd, setErrorNew)
            if (error) {
                setErrorNew(error)
                return
            }

            error = checkPass(confirmPwd, setErrorNew)
            if (error) {
                setErrorNew(error)
                return
            }

            const response = await newPassword({
                user,
                oldPassword: oldPwd,
                newPassword: newPwd
            })

            if (!response.status) {
                setErrorNew('Parola veche incorecta')
                setTimeout(() => {
                    setErrorNew('')
                }, 3000)
            } else {
                setMessage('Parola a fost resetata cu success')
                setTimeout(() => {
                    setMessage('')
                }, 3000)
            }
        }
    }

    const registerHandler = async (e) => {
        e.preventDefault()

        if (credentials.company.includes('Numele companiei')) {
            setError('Pentru a creea un utilizator este nevoie de a fi selectata o companie')
        }

        if (error) {
            return
        }

        const response = await loginUser({
            user,
            username: credentials.username,
            password: credentials.password,
            lastName: credentials.lastName,
            firstName: credentials.firstName,
            userEmail: credentials.userEmail,
            role: credentials.role,
            company: credentials.company,
        })

        if (!response) {
            setError('Date incorecte')
            setMessage('')
        } else {
            setMessage('Utilizatorul a fost creat cu success')
            setError('')
        }
    }

    if (!companies || !stats) {
        return (<p>Loading...</p>)
    }


    return (
        <>
            <main className="px-4 py-16 min-h-screen bg-gray-100">
                <section className="w-full max-w-7xl mx-auto">
                    <div className="flex justify-end">
                        <Link
                            className="mb-4 flex items-center rounded-md bg-gray-300 py-3 px-8 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out text-lg font-bold text-gray-600 mt-5"
                            to="/"
                        >
                            <span className="mr-1">Home</span>
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-10 sm:px-12 lg:px-24">
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full lg:w-1/3 px-3">
                                <span className="flex justify-center items-center w-12 h-12">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
									  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						</span>
                                <strong className="text-lg md:text-xl font-bold block mt-9">Numele Prenumele: <span
                                    className="text-gray-600">{user.user.lastName} {user.user.firstName}</span></strong>
                                <strong className="text-lg md:text-xl font-bold block mt-9">Nume utilizator: <span
                                    className="text-gray-600">{user.user.username}</span></strong>
                                <strong className="text-lg md:text-xl font-bold block mt-9">Email: <span
                                    className="text-gray-600">{user.user.userEmail}</span></strong>
                                <strong className="text-lg md:text-xl font-bold block mt-9">Rol: <span
                                    className="text-gray-600">{user.user.role}</span></strong>
                            </div>
                            <div className="w-full md:w-1/2 lg:w-1/3 px-3 mt-9 lg:mt-0">
                                <form>
                                    <strong className="text-lg md:text-xl font-bold">Actualizare parola:</strong>
                                    <div className="mt-9 relative">
								<span
                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
									  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</span>
                                        <input
                                            onChange={(e) => setOldPwd((prev) => e.target.value)}
                                            className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                            type="password" name="" placeholder="Parola actuala" value={oldPwd} />
                                    </div>
                                    <div className="mt-9 relative">
								<span
                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
									  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</span>
                                        <input
                                            onChange={(e) => setNewPwd((prev) => e.target.value)}
                                            className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                            type="password" name="" placeholder="Parola noua" value={newPwd} />
                                    </div>
                                    <div className="mt-9 relative">
								<span
                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
									  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</span>
                                        <input
                                            onChange={(e) => setConfirmPwd((prev) => e.target.value)}
                                            className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                            type="password" name="" placeholder="Repeta parola" value={confirmPwd} />
                                    </div>
                                    <div className="mt-9">
                                        <button
                                            onClick={updatePassword}
                                            className="w-full text-center py-3 px-6 rounded-full text-white bg-green-400 hover:bg-blue-600 transition duration-300 ease-in-out">Actualizare
                                        </button>
                                    </div>
                                    {errorNew ? (
                                        <p className="text-red-500 text-xs italic">{errorNew}</p>
                                    ) : null}
                                </form>
                            </div>
                            {
                                user.user.role === 'Admin' ? (
                                    <div className="w-full md:w-1/2 lg:w-1/3 px-3 mt-9 lg:mt-0">
                                        <form>
                                            <strong className="text-lg md:text-xl font-bold">Adaugare
                                                utilizator:</strong>
                                            <div className="mt-9 relative">
								<span
                                    className="flex justify-center items-center w-12 h-12 p-2 absolute z-10 left-2 top-1/2 -mt-6">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
								</span>
                                                <div className="relative">
                                                    <select
                                                        name="company"
                                                        onClick={handleSelect}
                                                        className="block appearance-none rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    >
                                                        <option>--Numele companiei--</option>
                                                        {
                                                            companies.status ? companies.data.map((item) => {
                                                                return (
                                                                    <option key={item.id}
                                                                            value={item.CompanyID}>{item.CompanyName}</option>
                                                                )
                                                            }) : null
                                                        }
                                                    </select>
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                        <svg className="fill-current h-4 w-4"
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             viewBox="0 0 20 20">
                                                            <path
                                                                d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-9 relative">
                                                <span
                                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                      <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    type="text" name="username" placeholder="Nume utilizator"
                                                    value={credentials.username}
                                                    onChange={handleInput} />
                                            </div>
                                            <div className="mt-9 relative">
                                                <span
                                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                      <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    type="text" name="firstName" placeholder="Nume"
                                                    value={credentials.firstName}
                                                    onChange={handleInput} />
                                            </div>
                                            <div className="mt-9 relative">
                                                <span
                                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                      <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    type="text" name="lastName" placeholder="Prenume"
                                                    value={credentials.lastName}
                                                    onChange={handleInput} />
                                            </div>
                                            <div className="mt-9 relative">
                                                <span
                                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                      <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    type="email" name="userEmail" placeholder="Email"
                                                    value={credentials.userEmail}
                                                    onChange={handleInput} />
                                            </div>
                                            <div className="mt-9 relative">
                                                <span
                                                    className="flex justify-center items-center w-12 h-12 p-2 absolute left-2 top-1/2 -mt-6">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24"
                                                         stroke="currentColor">
                                                      <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </span>
                                                <input
                                                    className="rounded-md w-full bg-gray-200 py-3 pl-16 pr-6 border-2 border-transparent focus:border-gray-400 focus:bg-transparent transition duration-300 ease-in-out"
                                                    value={credentials.password}
                                                    onChange={handleInput}
                                                    type="password" name="password" placeholder="Parola" />
                                            </div>
                                            <div className="mt-9">
                                                <button
                                                    className="w-full text-center py-3 px-6 rounded-full text-white bg-green-400 hover:bg-blue-600 transition duration-300 ease-in-out"
                                                    onClick={registerHandler}
                                                >Adaugă
                                                </button>
                                            </div>
                                        </form>
                                        {
                                            message ? (
                                                <p className="text-green-500 text-xs italic">{message}</p>
                                            ) : null
                                        }
                                        {
                                            error ? (
                                                <p className="text-red-500 text-xs italic">{error}</p>
                                            ) : null
                                        }
                                    </div>
                                ) : null
                            }
                        </div>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-10 sm:px-12 lg:px-24 mt-9">
                        <strong className="text-lg md:text-xl font-bold">Istoria încărcărilor:</strong>
                        <table className="w-full text-left mt-9">
                            <thead>
                            <tr>
                                <th className="py-2 px-3 bg-gray-100">Nume</th>
                                <th className="py-2 px-3 bg-gray-100">Data</th>
                                <th className="py-2 px-3 bg-gray-100">Polițe</th>
                                <th className="py-2 px-3 bg-gray-100">Rbns</th>
                                <th className="py-2 px-3 bg-gray-100">Plăți</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                stats.status ? stats.data.sort((a, b) => {
                                    return new Date(b.DateTime) - new Date(a.DateTime)
                                }).map((item, index) => {
                                    let current_datetime = new Date(item.DateTime)
                                    let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
                                    return (
                                        <tr key={index}>
                                            <td className="p-3">{user.user.firstName} {user.user.lastName}</td>
                                            <td className="p-3">{formatted_date.toString()}</td>
                                            <td className="p-3">{item.TotalPolicies}</td>
                                            <td className="p-3">{item.TotalPayments}</td>
                                            <td className="p-3">{item.TotalRbns}</td>
                                        </tr>
                                    )
                                }) : null
                            }
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </>
    )
}

export default Profile
