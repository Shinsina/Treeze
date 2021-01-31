import React from 'react';
import { Editor } from "@tinymce/tinymce-react";
import ReactHtmlParser from 'react-html-parser';
import {AuthConsumer} from './AuthContext'
import {postsRef} from '../firebase'
import Home from './Home'

class CreatePost extends React.Component {
  titleInput = React.createRef();
constructor(props) {
  super(props);
  //console.log(props)
  //console.log(props.match)
  if (!props.postId){
  this.state = {
    content: "",
    title: "",
    postingUser: "",
    createdAt: null,
    editing: false
  };
}
else {
  this.state = {
    content: props.content,
    title: props.title,
    postingUser: props.postingUser,
    createdAt: props.createdAt,
    postId: props.postId,
    editing: true,
  }
}
  this.handleChange = this.handleChange.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
}
handleChange(content, editor) {
  this.setState({content});
}
handleSubmit(event) {
  event.preventDefault();
  if(window.confirm("Are you sure you want to post this?")){
    const post = {
      content: this.state.content,
      title: this.titleInput.current.value, 
      postingUser: this.state.postingUser,
      createdAt: new Date()
    }
    if(this.state.editing === false){
      //console.log(this.state.editing + 'FIRST POSTING')
      postsRef.add({post})
      //alert("Post was submitted")
      this.props.history.push(`/${this.state.postingUser}/profile`)
    }
    if(this.state.editing === true) {
    //console.log(this.state.editing + 'EDITING POST')
     const currentPost = postsRef.doc(this.state.postId)
     currentPost.update({post})
     alert("Please refresh the page to update posts")
    }
    }
  }


setUser = (userId) => {
    this.setState({postingUser: userId});
}

redirectToProfile = (userId) => {
  //console.log(userId)
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
      {user.id ? (
  <div className="CreatePost bg-gray-600 h-screen space-y-4">
  <span className="PostHeader block text-center text-white text-6xl"><h1>Post Preview</h1></span>
  <span className="PostContent block h-1/2 overflow-y-scroll text-justify box-border px-1 border-8 border-green-500 bg-white"><h1 className="text-black break-words">{ReactHtmlParser(this.state.content)}</h1></span>
  <form onSubmit={this.handleSubmit}>
  <span className="block text-center"><input ref={this.titleInput} type='text' placeholder='Put title of post here' defaultValue={this.state.title}/></span>
  <span className="block text-center w-full bg-green-500 text-white"><button className="w-full" type="submit" onClick={(e => this.setUser(user.id))}>Submit Post</button></span>
  <span className="block h-full"><Editor value={this.state.content} init={{resize: false, plugins: [
             'advlist autolink lists link image charmap print preview anchor',
             'searchreplace visualblocks code fullscreen',
             'insertdatetime media table paste code help wordcount'],
           toolbar:
            'undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help'}}
            onEditorChange={this.handleChange} className="overflow-y-scroll w-full h-full"></Editor>
  </span>
  </form>
  {!this.state.editing ? (
    <span className="w-full bg-green-500 text-white">
    <button className="w-1/3 " onClick={(e)=> this.redirectToProfile(user.id)}>Return to Your Profile</button>
    <button className="w-1/3" onClick={(e)=> this.redirectToHome()}>Return to Home Page</button>
    <button className="w-1/3" onClick={(e)=> logOut()}>Log Out</button>
</span>)
: (<></>)}
  </div>
      ) : (<Home/>)}
  </>
  )}
  </AuthConsumer>
  );
}
}
export default CreatePost