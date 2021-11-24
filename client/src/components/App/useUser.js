import {useState} from 'react'

export default function useUser() {
    const getUser = () => {
        const tokenString = sessionStorage.getItem('user')
        const userToken = JSON.parse(tokenString)
        return userToken
    };

    const [user, setUser] = useState(getUser)

    const saveUser = (user) => {
        if (user === '') {
            sessionStorage.clear()
            setUser(null)
        } else {
            sessionStorage.setItem('user', JSON.stringify(user))
            setUser(user)
        }
    };

    return {
        setUser: saveUser,
        user
    }
}