import React from 'react'
import {usersRef} from '../firebase'
import {Link} from 'react-router-dom' 
import { AuthConsumer } from './AuthContext'

class Home extends React.Component {
    state = {
        blogsDisplayNames: [],
        blogsUniqueIds: [],
    }
    componentDidMount() {
        this.fetchUsers()
    }

    fetchUsers = async test => {
        try {
            const displayName = await usersRef
            .get()
            //displayName.docs()
            displayName.forEach(doc => {
                //console.log(doc.id, '=>', doc.data().user.displayName)
                this.setState({blogsDisplayNames: [...this.state.blogsDisplayNames, doc.data().user.displayName]})
                this.setState({blogsUniqueIds: [...this.state.blogsUniqueIds, doc.data().user.uniqueId]})
            })
        } catch(error){
            console.log(error)
        }
    }
    render () {
        return (
            <AuthConsumer>
            {({logOut}) => (
            <>
            <div className="homePage bg-gray-600 h-screen space-y-4">
            <div className="signUpHeader flex flex-col h-1/4 w-full box-border border-8 border-green-500 bg-white font-mono py-16">
                <p className="block xl:text-9xl lg:text-7xl md:text-4xl sm-text-3xl break-words text-center">Blog List for Treeze</p>
            </div>
            {Object.keys(this.state.blogsUniqueIds).map(key =>
            <div key={key}>
                <span className="block text-center"><Link to={`/${this.state.blogsUniqueIds[key]}/profile`} className="border-black border-2 bg-green-500 text-white">{this.state.blogsDisplayNames[key]}</Link></span>
            </div>
            )}
            <button className="w-full bg-green-500 text-white" onClick={(e)=> logOut()}>Log Out</button>
            </div>
            </>
            )}
            </AuthConsumer>
        )
    }
}

export default Home