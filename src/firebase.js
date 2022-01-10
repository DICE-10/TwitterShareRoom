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
var userData
export function useAuth() {
  const user = ref(null)
  const unsubscribe = auth.onAuthStateChanged(_user => (user.value = _user))
  onUnmounted(unsubscribe)
  const isLogin = computed(() => user.value !== null)

  const signIn = async () => {
    const twitterProvider = new firebase.auth.TwitterAuthProvider()
    await auth.signInWithPopup(twitterProvider)
      .then(( result ) => {
      userData = {
        id: result.user.uid,
        name: result.additionalUserInfo.username,
        email: result.additionalUserInfo.profile.email,
        sex: ''
      }
      console.log(userData)
    }).catch(error => {
      this.errorMessage = error.message
    })
  }
  const signOut = () => auth.signOut()

  return { user, isLogin, signIn, signOut }
}

const firestore = firebase.firestore()
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

  const { user, isLogin } = useAuth()
  const sendMessage = text => {
    if (!isLogin.value) return
    const { photoURL, uid, displayName } = user.value
    console.dir(user.value)
    messagesCollection.add({
      userName: displayName,
      userId: uid,
      userPhotoURL: photoURL,
      text: text,
      userArId: userData.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
  }

  return { messages, sendMessage }
}
