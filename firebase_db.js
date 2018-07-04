// Initialize Firebase
var config = {
    apiKey: "AIzaSyDV1-EjpNAZZ44Cm3oF-qfwiNBPBOrlKAI",
    authDomain: "hoc-tu-vung-71584.firebaseapp.com",
    databaseURL: "https://hoc-tu-vung-71584.firebaseio.com",
    projectId: "hoc-tu-vung-71584",
    storageBucket: "",
    messagingSenderId: "362463599906"
};

firebase.initializeApp(config);

var collectionDefaultRef = null, collectionUserRef = null;

function FireBaseDB() {
    checkSetup();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
function initFirebase(callback) {
    // TODO(DEVELOPER): Initialize Firebase.
    // Shortcuts to Firebase SDK features.
    auth = firebase.auth();
    auth.signInAnonymously();
    auth.onAuthStateChanged(callback);
};



// Saves a new message on the Firebase DB.
function saveMessage(messagesRef, data) {
    return messagesRef.set(data).key;
};

function updateMessage(messagesRef, data) {
    return messagesRef.set(data);
};

function deleteMessage(messagesRef) {
    return messagesRef.remove();
};

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions and make ' +
            'sure you are running the codelab using `firebase serve`');
    }
};
FireBaseDB();