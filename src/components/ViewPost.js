import React from 'react';
import {postsRef, commentsRef, usersRef} from '../firebase'
import ReactHtmlParser from 'react-html-parser'
import {AuthConsumer} from './AuthContext'

class ViewPost extends React.Component {
    commentInput = React.createRef();
    constructor(props){
        super(props);
        //console.log(this.props.match.params)
        this.handleCommentSubmit.bind(this)
    }
    state = {
        content: "",
        title: "",
        postingUser: "",
        createdAt: "",
        postId: "",
        comments: [],
        editingComment: false,
        editingCommentId: '',
        editingCommentContent: '',
        displayName: '',
        commenterDisplayName: '',
    }
    componentDidMount() {
        this.fetchPost(this.props.match.params.postKey)
        this.setState({displayName: this.props.match.params.displayName})
        this.fetchComments(this.props.match.params.postKey)
    }

    handleCommentSubmit= async (e,userId) => {
        e.preventDefault()
        try {
            const displayName = await usersRef
            .where('user.uniqueId', '==', userId)
            .get()
            //displayName.docs()
            displayName.forEach(doc => {
                //console.log(doc.id, '=>', doc.data().user.displayName)
                this.setState({commenterDisplayName: doc.data().user.displayName})
            })
            const comment = {
                postId: this.state.postId,
                content: this.commentInput.current.value,
                commentingUser: userId,
                commenterDisplayName: this.state.commenterDisplayName,
                createdAt: new Date()
            }
            commentsRef.add({comment})
        } catch(error){
            console.log(error)
        }
    }

    fetchPost = async postKey => {
        try {
        const post = postsRef.doc(postKey);
        const doc = await post.get();
        //console.log(doc.data().post);
        this.setState({content: doc.data().post.content, title: doc.data().post.title, postingUser: doc.data().post.postingUser, createdAt: doc.data().post.createdAt.toDate().toLocaleString(), postId: postKey})
        }
        catch(error) {
            console.log(error)
        }
    }

    fetchComments = async postKey => {
        try {
            const comments = commentsRef
            .where('comment.postId', '==', postKey)
            .orderBy('comment.createdAt', 'desc')
            .onSnapshot(snapShot => {
                snapShot.docChanges()
                .forEach(change=> {
                    if(change.type === 'added'){
                        const doc = change.doc
                        const comment = {
                            id: doc.id,
                            content: doc.data().comment.content,
                            createdAt: doc.data().comment.createdAt.toDate().toLocaleString(),
                            postId: doc.data().comment.postId,
                            commentingUser: doc.data().comment.commentingUser,
                            commenterDisplayName: doc.data().comment.commenterDisplayName
                        }
                        this.setState({comments: [...this.state.comments, comment]})
                    }
                    if(change.type === 'removed') {
                        this.setState({comments: [...this.state.comments.filter(comment => 
                            {
                                return comment.id !== change.doc.id
                            })]
                        })
                    }
                })
            })
        }catch(error) {
            console.log(error)
        }
    }

    deleteComment = async (e,commentId) => {
        e.preventDefault()
        if(window.confirm("Are you sure you want to delete this comment?")){
            try {
                const comment = await commentsRef.doc(commentId)
                this.setState({comments: [...this.state.comments.filter(comment => {
                    return comment.id !== commentId
                })
            ]
            })
            comment.delete()
        } catch(error) {
                console.log(error)
            }
        } 
    }

    handleEditComment = async(e,editingId,editingUser) => {
        e.preventDefault()
        //console.log(this.state.commenterDisplayName)
        const comment = {
            postId: this.state.postId,
            content: this.commentInput.current.value,
            commentingUser: editingUser,
            commenterDisplayName: this.state.commenterDisplayName,
            createdAt: new Date()
        }
        //console.log(comment)
        const currentComment = commentsRef.doc(editingId)
        currentComment.update({comment})
        alert("Please refresh the page to update comments")
    }

    setUpdateComment = (e,commentId,commentContent, commenterDisplayName) => {
        e.preventDefault()
        this.setState({editingComment: !this.state.editingComment, editingCommentId: commentId, editingCommentContent: commentContent, commenterDisplayName: commenterDisplayName})
    }

    redirectToProfile = (userId) => {
        this.props.history.push(`/${userId}/profile`)
    }
    
    redirectToHome = () => {
        this.props.history.push('/')
    }

    render () {
        return (
        <AuthConsumer>
        {({user, logOut}) => ( 
            <>
            <div className="Post bg-gray-600 h-screen space-y-4">
            <div className="PostWrapper w-full box-border border-8 border-green-500 bg-white">
            <h1 className="block text-center text-5xl font-mono">{this.state.title}</h1>
            <h2 className="block text-center text-3xl font-mono">{this.state.displayName}</h2>
            <h3 className="block text-center text-xl font-mono">{this.state.createdAt}</h3>
            <div className="block text-xl break-words">{ReactHtmlParser(this.state.content)}</div>
            </div>
            <span className="block w-full bg-gray-600">
                {user.id ? 
                <>
                {this.state.editingComment ? 
                <div><input className="px-1 w-3/4" ref={this.commentInput} type='text' placeholder='Type a comment here!' defaultValue={this.state.editingCommentContent}/>
                <button className="w-1/4 text-center bg-green-500 text-white border-2 border-black" onClick={(e) => this.handleEditComment(e, this.state.editingCommentId, user.id)}>Submit Edit</button>
                </div> : 
                <div>
                <input className="px-1 w-3/4" ref={this.commentInput} type='text' placeholder='Type a comment here!' defaultValue=''/>
                <button className="w-1/4 text-center bg-green-500 text-white border-2 border-black" onClick={(e) => this.handleCommentSubmit(e,user.id)}>Submit</button></div>
                }
                </>
                : <></>
            }
                </span>
                {Object.keys(this.state.comments).map(key =>
                    <div key={key}>
                        
                        <div className="postComments w-full border-8 border-green-500 bg-white">
                            <div className="w-full">{this.state.comments[key].commenterDisplayName} {this.state.comments[key].createdAt} 
                            {(user.id === this.state.comments[key].commentingUser) ? <>
                            <button className="float-right text-lg align-text-top pr-1 bg-green-500 text-white border-2 border-black" onClick={(e) => this.deleteComment(e,this.state.comments[key].id)}>Delete Comment</button>
                            <button className="text-lg float-right bg-green-500 text-white border-2 border-black" onClick={(e) => this.setUpdateComment(e, this.state.comments[key].id, this.state.comments[key].content, this.state.comments[key].commenterDisplayName)}>Edit Comment</button>
                            </> 
                            : <></>}
                            {(user.id === this.props.match.params.userId && user.id !== this.state.comments[key].commentingUser) ? 
                            <> 
                            <button className="float-right text-lg align-text-top pr-1 bg-green-500 text-white border-2 border-black" onClick={(e) => this.deleteComment(e,this.state.comments[key].id)}>Delete Comment</button>
                            </>
                            :  <></>}
                            </div>
                            <p className="block font-mono">{this.state.comments[key].content}</p>
                        </div>
                    </div>
                    )}
                    <span className="w-full bg-green-500 text-white">
                        <button className="w-1/3 " onClick={(e)=> this.redirectToProfile(this.state.postingUser)}>Return to Poster's Profile</button>
                        <button className="w-1/3" onClick={(e)=> this.redirectToHome()}>Return to Home Page</button>
                        <button className="w-1/3" onClick={(e)=> logOut()}>Log Out</button>
                    </span>
            </div>
            </>
            )}
            </AuthConsumer>
        )
    }
}

export default ViewPost