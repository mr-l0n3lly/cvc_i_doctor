import React from "react"
import "./tailwind.css"
import "./App.scss"

import { BrowserRouter, Switch, Route } from 'react-router-dom'

import useUser from './components/App/useUser'

import Home from "./components/Home/Home.component";
import Profile from './components/Profile/Profile.component'

const App = () => {
    return (
        <div className="App">
            <BrowserRouter>
                <Switch>
                    <Route exact={true} path="/">
                        <Home />
                    </Route>
                </Switch>
            </BrowserRouter>
        </div>
    )
}

export default App
