import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

//import Filter from 'bad-words'
import { ref, onUnmounted, computed } from 'vue'

firebase.initializeApp({
  apiKey: "AIzaSyA1_hSMG8fYBqUnb0voC-we6H86agazAEo",
  authDomain: "twittershareroom.firebaseapp.com",
  databaseURL: "https://twittershareroom-default-rtdb.firebaseio.com",
  projectId: "twittershareroom",
  storageBucket: "twittershareroom.appspot.com",
  messagingSenderId: "409618468677",
  appId: "1:409618468677:web:56c65a38512eb2da0e382c",
  measurementId: "G-W309RG9E0Y"
})

const auth = firebase.auth()
const firestore = firebase.firestore()
export function useAuth() {
  const user = ref(null)
  const userData = ref(null)
  const unsubscribe = auth.onAuthStateChanged(_user => (user.value = _user), _userData => (userData.value = _userData))
  onUnmounted(unsubscribe)
  const isLogin = computed(() => user.value !== null)

  const signIn = async () => {
    const twitterProvider = new firebase.auth.TwitterAuthProvider()
    await auth
      .signInWithPopup(twitterProvider)
      .then(result => {
        const { photoURL, uid, displayName, email } = result.user
        const { username } = result.additionalUserInfo
        if (getFirestore(uid, username) == -1) {
          console.dir(result.user)
          console.dir(result.additionalUserInfo)
          firestore.collection('users').add({
            uid: uid,
            displayName: displayName,
            userID: username,
            email: email,
            photoURL: photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updateAt: firebase.firestore.FieldValue.serverTimestamp()
          })
        }
      })
      .catch(error => {
        console.dir(error)
      })
  }
  const signOut = () => auth.signOut()

  return { user, isLogin, userData, signIn, signOut }
}

function getFirestore(uid, userId) {
  const user = firestore
    .collection('users')
    .where('uid', '==', uid)
    .get()
  console.log("users")
  if (user !== null || user.length !== 0) {
    if (user.userID == userId) {
      return 0
    } 
    else {
      console.log(user.docs.map(postDoc => postDoc.id))
      user.forEach(postDoc => {
        firestore
          .collection('users')
          .doc(postDoc.id)
          .update({
            userID: userId,
            updateAt: firebase.firestore.FieldValue.serverTimestamp()
          })
      })
      return 1
    }
  }
  else {
    return -1
  }
}

const messagesCollection = firestore.collection('messages')
const messagesQuery = messagesCollection.orderBy('createdAt', 'desc').limit(100)
//const filter = new Filter()

export function useChat() {
  const messages = ref([])
  const unsubscribe = messagesQuery.onSnapshot(snapshot => {
    messages.value = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .reverse()
  })
  onUnmounted(unsubscribe)

  const { user, isLogin, userData } = useAuth()
  const sendMessage = text => {
    if (!isLogin.value) return
    const { photoURL, uid, displayName } = user.value
    console.dir(user.value)
    messagesCollection.add({
      userName: displayName,
      userId: uid,
      userPhotoURL: photoURL,
      text: text,
      userAtId: userData.value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
  }

  return { messages, sendMessage }
}
