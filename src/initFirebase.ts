import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import authStore from './stores/authStore';

export default function initFirebase(): void {
	const firebaseConfig = {
		apiKey: 'AIzaSyCa2zpxsHQKH1LLNiQKlc02OfBI0zPk3VI',
		authDomain: 'file-upload-service-e10b0.firebaseapp.com',
		projectId: 'file-upload-service-e10b0',
		storageBucket: 'file-upload-service-e10b0.appspot.com',
		messagingSenderId: '459512707197',
		appId: '1:459512707197:web:d206a9187fa16291a29914',
		databaseURL: 'https://file-upload-service-e10b0-default-rtdb.europe-west1.firebasedatabase.app'
	};

	firebase.initializeApp(firebaseConfig);

	firebase.auth().onAuthStateChanged((user) => {
		authStore.set({
			isLoggedIn: !!user,
			user,
			firebaseControlled: true
		});
	});
}
