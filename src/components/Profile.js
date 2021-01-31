import React from 'react'
import {usersRef, commentsRef, postsRef} from '../firebase'
import {AuthConsumer} from './AuthContext'
import ReactHtmlParser from 'react-html-parser';
import CreatePost from './CreatePost'


class Profile extends React.Component {
    state = {
        editable: false,
        posts: [],
        editing: false,
        userId: '',
        displayName: '',
    }
    componentDidMount() {
        this.fetchPosts(this.props.match.params.userId)
        this.setState({userId: this.props.match.params.userId})
        this.fetchDisplayName(this.props.match.params.userId)
    }
    fetchDisplayName= async userId => {
        try {
            const displayName = await usersRef
            .where('user.uniqueId', '==', userId)
            .get()
            //displayName.docs()
            displayName.forEach(doc => {
                //console.log(doc.id, '=>', doc.data().user.displayName)
                this.setState({displayName: doc.data().user.displayName})
            })
        } catch(error){
            console.log(error)
        }
    }
    fetchPosts = async userId => {
    try {
       const posts = await postsRef
       .where('post.postingUser', '==', userId)
       .orderBy('post.createdAt','desc')
       .onSnapshot(snapshot => {
           snapshot.docChanges()
           .forEach(change => {
               if(change.type === 'added'){
                   const doc = change.doc
                   const post = {
                       id: doc.id,
                       content: doc.data().post.content,
                       title: doc.data().post.title,
                       postingUser: doc.data().post.postingUser,
                       createdAt: doc.data().post.createdAt,
                       editing: false
                   }
                   this.setState({posts: [...this.state.posts, post]})
               }
               if(change.type === 'removed') {
                   this.setState({posts: [...this.state.posts.filter(post =>
                    {
                        return post.id !== change.doc.id
                    })]
                })
               }
           })
       })
    } catch(error) {
        console.log("Error fetching posts", error)
    }
}

deletePost = async (e,postId) => {
    e.preventDefault()
    if(window.confirm("Are you sure you want to delete this post?")) {
    try {
    const post = await postsRef.doc(postId)
    this.setState({
        posts: [...this.state.posts.filter(post => {
            return post.id !== postId
        })
    ]
    })
    const comments = await commentsRef
    .where('comment.postId', '==',postId)
    .get()
    comments.forEach(doc => {
        //console.log(doc.id, '=>', doc.data())
        //console.log(doc.id)
        const comment = commentsRef.doc(doc.id)
        comment.delete()
    })
    post.delete()
} catch(error) {
    console.error('Error deleting post:', error)
}
    }
}

setUpdatePost = (e, key) => {
    e.preventDefault()
    this.state.posts[key].editing = !this.state.posts[key].editing
    this.forceUpdate()
}

routeToCreatePost = (e) => {
    e.preventDefault()
    this.props.history.push('/createpost')
}

routeToViewPost = (e, postKey) => {
    e.preventDefault()
    this.props.history.push(`/${this.state.userId}/${this.state.displayName}/${this.state.posts[postKey].id}`)
}

redirectToHome = () => {
    this.props.history.push('/')
}

    render() {
        return (
            <AuthConsumer>
                {({user, logOut}) => (
                    <>
                    {user.id === this.props.match.params.userId ? this.state.editable = true : this.state.editable = false}
                    <div className="profileContainer bg-gray-600 h-screen space-y-4">
                    <div className="PostContent flex flex-col h-1/4 w-full box-border border-8 border-green-500 bg-white font-mono py-16">
                    <h1 className="block lg:text-6xl md:text-3xl sm:text:2xl break-words text-center">Welcome to the blog of {this.state.displayName}</h1>
                    </div>
                    {Object.keys(this.state.posts).map(key =>
                    <div key={key}>
                        <div className="profilePosts h-52 w-full box-border border-8 border-green-500 bg-white overflow-y-scroll">
                        {this.state.editable ? <span className="text-right bg-green-500 text-white w-full">
                            <button className="w-1/2 border-2 border-black" onClick={(e)=> this.setUpdatePost(e, key)}>Edit This Post</button>
                            <button className="w-1/2 border-2 border-black" onClick={(e) => this.deletePost(e, this.state.posts[key].id)}>Delete This Post</button>
                            </span> 
                            : <p></p>}
                            <h1 className="block text-center text-5xl font-mono">{this.state.posts[key].title}</h1>
                            <h2 className="block text-center text-3xl font-mono">{this.state.displayName}</h2>
                            <h3 className="block text-center text-xl font-mono">{this.state.posts[key].createdAt.toDate().toLocaleString()}</h3>
                            <div className="block text-xl break-words">{ReactHtmlParser(this.state.posts[key].content)}</div>
                        </div>
                        <span className="block text-center w-full bg-green-500 text-white"><button className="w-full" onClick={(e) => this.routeToViewPost(e,key)}>View Post in Separate Page</button></span>
                        {this.state.posts[key].editing ? <CreatePost postId= {this.state.posts[key].id} content={this.state.posts[key].content} title={this.state.posts[key].title} postingUser={this.state.posts[key].postingUser} date={this.state.posts[key].createdAt}/>: <p></p>}
                        </div>
                        )}
                        {this.state.editable ? <span className="block text-center w-full bg-green-500 text-white"><button className="w-full" onClick={(e) => this.routeToCreatePost(e)}>Create New Post</button></span> : <p></p>}
                        <span className="w-full bg-green-500 text-white">
                            <button className="w-1/2" onClick={(e)=> this.redirectToHome()}>Return to Home Page</button>
                            <button className="w-1/2" onClick={(e)=> logOut()}>Log Out</button>
                        </span>
                        </div>
                    </>
                )}  
            </AuthConsumer>
        )
    }
}

export default Profile