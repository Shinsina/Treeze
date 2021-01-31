import React from 'react'
import CreatePost from './components/CreatePost'
import UserForm from './components/UserForm'
import AuthProvider from './components/AuthContext'
import Profile from './components/Profile'
import ViewPost from './components/ViewPost'
import {BrowserRouter, Switch, Route} from 'react-router-dom'



class App extends React.Component {
  render () {
    return(
      <>
      <BrowserRouter>
      <AuthProvider>
      <Switch>
      <Route exact path="/" component={UserForm}/>
      <Route exact path="/:userId/profile" component={Profile}/>
      <Route exact path="/createpost" component={CreatePost}/>
      <Route exact path="/:userId/:displayName/:postKey" component={ViewPost}/>
      </Switch>
      </AuthProvider>
      </BrowserRouter>
    </>
    );
  }
}

export default App;
