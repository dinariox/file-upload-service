<script lang="ts">
	import { onMount } from 'svelte';
	import { BACKEND_URL } from '/src/urls';
	import initFirebase from '/src/initFirebase';
	import firebase from 'firebase/compat/app';
	import 'firebase/compat/database';
	import 'firebase/compat/auth';
	import authStore from '/src/stores/authStore';
	import { goto } from '$app/navigation';
	import axios from 'axios';

	// const BACKEND_URL = 'http://vollsm.art:5200';

	let loadingDone = false;
	let fileList = [];

	onMount(() => {
		initFirebase();

		authStore.subscribe((info) => {
			if (!info.isLoggedIn) {
				// goto('/');
				return;
			}

			firebase
				.database()
				.ref('/files/')
				.orderByChild('uploadedByUid')
				.equalTo(info.user.uid)
				.on('value', (snapshot) => {
					fileList = [];

					snapshot.forEach((child) => {
						fileList.push({ uploadId: child.key, ...child.val() });
					});

					loadingDone = true;
				});
		});
	});

	function fileSizeString(size: number): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let i = 0;
		while (size >= 1024) {
			size /= 1024;
			i++;
		}
		return `${+size.toFixed(2)} ${units[i]}`;
	}

	function formatDateString(date: string): string {
		const d = new Date(date);
		// return "YYYY/MM/DD HH:mm:ss" with leading zeros
		return (
			d.getFullYear() +
			'/' +
			('0' + (d.getMonth() + 1)).slice(-2) +
			'/' +
			('0' + d.getDate()).slice(-2) +
			' ' +
			('0' + d.getHours()).slice(-2) +
			':' +
			('0' + d.getMinutes()).slice(-2) +
			':' +
			('0' + d.getSeconds()).slice(-2)
		);
	}

	function deleteFile(uploadId: string) {
		if (!confirm('Are you sure you want to delete this file?')) {
			return;
		}

		axios.delete(`${BACKEND_URL}/file/${uploadId}`).then(() => {
			firebase.database().ref('/files/').child(uploadId).remove();
		});
	}

	async function loginWithGoogle() {
		try {
			const provider = new firebase.auth.GoogleAuthProvider();
			await firebase.auth().signInWithPopup(provider);
		} catch (e) {
			console.error(e);
		}
	}

	function handleLogout() {
		firebase.auth().signOut();
	}
</script>

<svelte:head>
	<title>vollsm.art - Your account</title>
</svelte:head>

<div id="background">
	<div id="logo">
		<a href="/">vollsm.art</a>
	</div>

	{#if $authStore.isLoggedIn}
		<div id="user-info">
			<p title={'Logged in as ' + $authStore.user.email}>
				<small>Logged in as</small>
				<strong>{$authStore.user.displayName}</strong>
			</p>
			<button on:click={handleLogout} title="Log out">
				<svg
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/></svg
				>
			</button>
		</div>

		<div id="account-wrapper">
			<h1>Your uploaded files</h1>
			{#if !loadingDone}
				<p>Loading...</p>
			{:else if loadingDone && fileList.length > 0}
				<ul>
					{#each fileList as file}
						<li>
							<svg
								class="file-icon"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
								/></svg
							>
							<div class="file-text">
								<p class="file-name">
									{file.name}
								</p>
								<p class="file-info">
									{fileSizeString(file.size)} &hybull; uploaded {formatDateString(file.uploadedAt)}
								</p>
							</div>
							<a class="view-button" href={`/download/${file.uploadId}`} target="_blank">
								<svg
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/></svg
								>
								<span>View</span>
							</a>
							<a
								class="delete-button"
								on:click={() => {
									deleteFile(file.uploadId);
								}}
							>
								<svg
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/></svg
								>
								<span>Delete</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No files found</p>
			{/if}

			<button
				id="return-button"
				on:click={() => {
					goto('/');
				}}
			>
				Upload a file
			</button>
		</div>
	{:else}
		<div id="login-wrapper">
			<h1>Login to check your account</h1>
			<button on:click={loginWithGoogle}>
				<img src="../static/img/btn_google_light_normal_ios.svg" alt="Login with Google" />
				<p>Sign in with Google</p>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	#background {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: #714d69;

		#logo {
			position: absolute;
			top: 16px;
			left: 32px;

			a {
				font-size: 2em;
				font-weight: bold;
				color: #fff;
				text-decoration: none;
				margin: 0;
				font-family: 'Caveat', cursive;
				user-select: none;
				opacity: 0.8;

				&:hover {
					opacity: 1;
				}
			}
		}

		#user-info {
			position: absolute;
			top: 16px;
			right: 32px;
			display: flex;
			align-items: center;

			p {
				color: #fff;
				margin: 0;
			}

			button {
				background: rgba(255, 255, 255, 0.8);
				border: none;
				padding: 4px;
				border-radius: 999px;
				height: 32px;
				width: 32px;
				margin-left: 8px;
				transition: background 0.2s ease-in-out;
				cursor: pointer;

				&:hover {
					background: rgba(255, 255, 255, 1);
				}

				svg {
					color: #000;
					padding: 2px;
				}
			}
		}

		#account-wrapper {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			min-width: 500px;
			width: 50%;
			max-width: 800px;
			background-color: #dbd3d8;
			border-radius: 20px;
			padding: 20px;
			box-shadow: 0 0 28px rgba(0, 0, 0, 0.3);

			text-align: center;

			h1 {
				font-size: 1.75em;
				margin-top: 16px;
				margin-bottom: 16px;
			}

			ul {
				list-style: none;
				padding: 0 16px;

				li {
					margin: 4px 0;
					background-color: #ece6ea;
					padding: 8px;
					display: grid;
					grid-template-columns: min-content auto min-content min-content;
					align-items: center;
					border-radius: 16px;

					.file-icon {
						width: 40px;
						height: 40px;
						color: #6b6567;
					}

					.file-text {
						flex: auto;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;

						.file-name {
							text-align: left;
							margin: 8px 16px 2px 8px;
							overflow: hidden;
							text-overflow: ellipsis;
							margin-right: 16px;
						}

						.file-info {
							text-align: left;
							margin: 2px 16px 8px 8px;
							overflow: hidden;
							text-overflow: ellipsis;
							margin-right: 16px;
							color: #868686;
						}
					}

					a {
						height: 40px;
						border-radius: 999px;
						text-decoration: none;
						color: white;
						display: flex;
						padding: 8px 16px;
						box-sizing: border-box;
						width: fit-content;
						margin-right: 4px;
						transition: background-color 0.2s ease-in-out;
						cursor: pointer;

						&.view-button {
							background-color: #16a085;

							&:hover {
								background-color: #21c2a2;
							}
						}

						&.delete-button {
							background-color: #af4154;

							&:hover {
								background-color: #d1455c;
							}
						}

						span {
							margin-left: 6px;
							position: relative;
							top: 2px;
						}
					}
				}
			}
		}

		#login-wrapper {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			min-width: 500px;
			width: 50%;
			max-width: 800px;
			background-color: #dbd3d8;
			border-radius: 20px;
			padding: 20px;
			box-shadow: 0 0 28px rgba(0, 0, 0, 0.3);

			text-align: center;

			h1 {
				font-size: 1.75em;
				margin-top: 16px;
				margin-bottom: 6px;
			}

			button {
				background-color: white;
				border: none;
				padding: 0;
				border-radius: 4px;
				display: flex;
				align-items: center;
				box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
				position: relative;
				left: 50%;
				transform: translateX(-50%);
				margin-top: 32px;
				margin-bottom: 16px;
				cursor: pointer;
				transition: background-color 0.2s ease-in-out;

				&:hover {
					background-color: #4285f4;
					> p {
						color: white;
					}
				}

				p {
					margin: 0 16px 0 8px;
					font-size: 1.25em;
					font-weight: bold;
					color: #303030;
					transition: color 0.2s ease-in-out;
				}
			}
		}

		#return-button {
			background-color: #af4154;
			height: 40px;
			border-radius: 999px;
			color: white;
			padding: 8px 16px;
			border: none;
			font-size: 1em;
			font-weight: 500;
			font-family: 'Work Sans', sans-serif;
			transition: background-color 0.2s ease-in-out;
			cursor: pointer;

			&:hover {
				background-color: #d1455c;
			}
		}
	}
</style>
