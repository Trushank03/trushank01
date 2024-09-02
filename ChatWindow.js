import React, { useState, useEffect, useRef } from "react";
import classes from "./ChatWindow.module.css";
import { Picker } from "emoji-mart";
import {
  BsChat,
  BsEmojiSmile,
  BsThreeDotsVertical,
  BsSearch,
  BsCameraVideo,
  BsTelephone,
  BsCheck2All,
  BsX
} from "react-icons/bs";
import { MdSend, MdOutlineAttachment } from "react-icons/md";
import { postchatcomment, getchatcomments, getchatgroupbyId } from '../../../CommonApps/AllAPICalls';
import RightMsg from "./RightMsg";
import LeftMsg from "./LeftMsg";
import ProfileImage from "../AkshayChatNavBar/profile.jpg";
import ChatScreen from "./ChatScreen";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import getFCMToken, { storage, data } from "../../../CommonApps/Reshwanth/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";









const ChatWindow = (props) => {

  const clickedGroupIdT = localStorage.getItem('clickedChatGroupId');
  const [chatGroup, getChatGroupById] = useState(null);
  const [commentObj, setChatCommentObj] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [displayUser, setDisplayUser] = useState(null);
  const [firebaseComment, setFirebaseComment] = useState(null);
  const [bool, setBool] = useState(false);
  const [unReadMessage, setUnReadMessage] = useState("0");


  useEffect(() => {
    const groupId = props.clickedGroupId;
    let pageno = pageNum;
    groupId !== 0 && getchatcomments({ setChatCommentObj, groupId, pageno });
    groupId !== 0 && getchatgroupbyId({ groupId, getChatGroupById });
    setReplyDoc(null);
  }, [props.clickedGroupId, pageNum]);

  useEffect(() => {
    const groupId = props.clickedGroupId;
    groupId !== 0 && getchatgroupbyId({ groupId, getChatGroupById });
    props.setSplender(bool);
    //console.log("we are here at useEffect in chatWindow");
  }, [bool]);


  useEffect(() => {

    // console.log("props.clickedGroupId (useEffect): ", props.clickedGroupId); 
    // console.log("chatGroup: ", chatGroup);

    {
      chatGroup !== null && chatGroup.groupType === "oneoone" &&

        chatGroup.groupuserObjects.forEach((user, index) => {

          if (user.id !== props.userData.id) {
            setDisplayUser(displayUser => user);

          }

        })
    }

  }, [chatGroup, props.clickedGroupId]);


  useEffect(() => {
    const groupId = props.clickedGroupId;
    if (!props.clickedGroupId) {
      return;
    }
    if (!storage) {
      return;
    }
    const unsubscribe = onSnapshot(collection(storage, `chatRooms/${groupId}/chats`), (querySnapshot) => {
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push(doc.data());
      });
      setFirebaseComment(comments);
      setBool(bool => !bool);
    });
    return unsubscribe;
  }, [props.clickedGroupId])


  let displayMessage = [];


  const loadUpHandler = () => {
    if (commentObj !== null && commentObj.next !== null) {
      setPageNum(pageNum => pageNum + 1);
    }
  }


  const loadDownHandler = () => {
    if (commentObj !== null && commentObj.previous !== null) {
      setPageNum(pageNum => pageNum - 1);
    }
  }

  const [message, setMessage] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const [replyDoc, setReplyDoc] = useState(null);




  const handleChange = (e) => {
    setMessage(msg => e.target.value);
  };
  const sendToFireBase = async ({ groupId, userId, comment, image }) => {
    const date = new Date().toISOString();
    try {
      await sendNotification(groupId, userId);
      //console.log(unReadMessage);
    }
    catch (err) {
      //console.log(err);
    }
    if (image !== null) {
      try {
        const storageRef = ref(data, `${"image" + date}`);

        await uploadBytesResumable(storageRef, image).then(() => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            try {
              await setDoc(doc(storage, `chatRooms/${groupId}/chats`, "okay" + date), {
                chatMedia: downloadURL,
                isRead: false,
                message: null,
                senderId: userId,
                timestamp: date,
                documentId: "okay" + date,
              });
            } catch (err) {
              //console.log(err);
            }
          });
        });
      } catch (err) {
      }
    }

    else {
      if (comment !== undefined && comment !== "") {
        try {
          const value = Number(unReadMessage) + 1;
          // //console.log(value);
          await updateDoc(doc(storage, "chatRooms", String(groupId)), {
            chatroomId: groupId,
            lastMessage: comment,
            lastMessageSenderId: userId,
            lastMessageTimestamp: date,
            userIds: [groupId, userId],
            unRead: value,
          });
          await setDoc(doc(storage, `chatRooms/${groupId}/chats`, "okay" + date), {
            chatMedia: null,
            isRead: false,
            message: comment,
            senderId: userId,
            timestamp: date,
            documentId: "okay" + date,
            repliedMessageToDoc: replyDoc,

          });
          //console.log("request sent");
        }
        catch (err) {
          //console.log("request not sent");
        }
      }
    }

  }

  // const sendNotification = async (groupId) => {
  //   const docRef = doc(storage, "chatRooms", String(groupId)); // Assuming `groupId` is the ID of the document you want to read
  //   try {
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       setUnReadMessage(String(data.unRead));
  //       console.log(data.unRead);
  //     } else {
  //       console.log("No such document!");
  //     }
  //   } catch (e) {
  //     console.error("Error reading document:", e);
  //   }
  // }

  const sendNotification = (groupId) => {
    const docRef = doc(storage, "chatRooms", String(groupId)); // Assuming `groupId` is the ID of the document you want to listen to
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUnReadMessage(String(data.unRead));
      } else {
        //console.log("No such document!");
      }
    });

    return unsub; // Return the unsubscribe function
  }

  const sendMessageHandler = () => {
    const comment = message;
    const userId = props.userData.id;
    const groupId = clickedGroupIdT;
    const image = file;
    postchatcomment({ groupId, userId, comment });
    sendToFireBase({ groupId, userId, comment, image });
    setMessage('');
    setImageInput(imageInput => null);
    setFile(null);
    setPreview(false)
    setEmoji(false)
    setReplyDoc(null)
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessageHandler();
    }
  };

  const handleFileChange = (event) => {
    setFile(file => event.target.files[0]);
    setPreview(preview => true);
    //console.log('Selected file:', file);
  };

  const fileInput = useRef();

  const handleButtonClick = () => {
    fileInput.current.click();
  };
  const emojiSmileHandler = () => {
    setEmoji(emoji => !emoji);
  }
  const addEmojiToText = (e) => {
    setMessage(message => message + e.native);
  }


  return (
    <div className={classes.chatwindow}>

      {clickedGroupIdT === Number(0) && <div className={classes.noGroupSelectDiv}> Please select a chat to continue </div>}


      {clickedGroupIdT !== Number(0) && <>

        <div className={classes.topBarRight}>
          <div className={classes.userParentContainer}>

            <img className={classes.userImage} src={displayUser !== null ? displayUser.profile_image : "N/A"} alt="logo" />


            <div className={classes.detailUser}>
              <div className={classes.userName}>
                {displayUser !== null ?
                  (displayUser.firstname !== "" ? displayUser.firstname + " " + displayUser.lastname : displayUser.username) :
                  "Name not available"}
              </div>
              <div className={classes.userlastSeen}>
                last seen today at 10:24 am
              </div>
            </div>
          </div>

          <div className={classes.btnContainer}>
            <button className={classes.img1}>
              <BsTelephone size={20}></BsTelephone>
            </button>

            <button className={classes.img2}>
              <BsCameraVideo size={20}></BsCameraVideo>
            </button>

            <button className={classes.img3}>
              <BsSearch size={20}></BsSearch>
            </button>

            <button className={classes.img4}>
              <BsThreeDotsVertical size={20}></BsThreeDotsVertical>
            </button>
          </div>
        </div>


        {/*		    
      <div className={classes.msgContainer}>
        <div className={classes.dayContainer}>
          <div className={classes.day}>Today</div>
        </div>
        <LeftMsg />
        <RightMsg />
        <LeftMsg />
        <RightMsg />
        <LeftMsg />
        <LeftMsg />
        <RightMsg />
        <LeftMsg />
        <RightMsg />
        <LeftMsg />
        <RightMsg />
        <LeftMsg />
        <RightMsg />
      </div>
     */}

        {!preview && <ChatScreen messages={displayMessage}
          commentObj={commentObj !== null ? commentObj.results : []}
          previousComments={commentObj !== null ? commentObj.previous : null}
          currentUser={props.userData.id}
          loadUpHandler={loadUpHandler}
          loadDownHandler={loadDownHandler}
          chatGroup={chatGroup}
          firebaseComment={firebaseComment}
          groupId={clickedGroupIdT}
          setReplyDoc={setReplyDoc}
          replyDoc={replyDoc}
          userData={props.userData}
        />}

        {preview && <div className={classes.previewDiv}>
          <div className={classes.mainPreview}>
            <div className={classes.imageContainer}>
              <img className={classes.previewImage} src={URL.createObjectURL(file)} />
            </div>
            <button className={classes.previewButton} onClick={() => setPreview(null)}>    <BsX size={30} /></button>
          </div>
        </div>

        }
        {emoji && <div className={classes.emojiContainer}>
          <div className={classes.emojiDiv}>
            <Picker onSelect={addEmojiToText} />
          </div>
        </div>
        }

        <div className={classes.bottomNavigationBar}>
          <button className={classes.icon1} onClick={emojiSmileHandler}>
            <BsEmojiSmile size={25}></BsEmojiSmile>
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            // value={imageInput}
  value={imageInput || ''}
            ref={fileInput}
          />
          <button className={classes.icon2} onClick={handleButtonClick}>
            <MdOutlineAttachment size={25}></MdOutlineAttachment>
          </button>



          <div className={classes.msgInput}>
            <input
              type="text"
              placeholder="Type a message"
              className={classes.msgBox}
              value={message}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />
          </div>



          <button className={classes.icon3} onClick={sendMessageHandler} >
            <MdSend size={25} ></MdSend>
          </button>
        </div>


      </>

      }

    </div>
  );
};
export default ChatWindow;
