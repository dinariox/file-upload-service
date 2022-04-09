<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { BACKEND_URL } from '/src/urls';
	import initFirebase from '/src/initFirebase';
	import firebase from 'firebase/compat/app';
	import 'firebase/compat/database';
	import 'firebase/compat/auth';
	import authStore from '/src/stores/authStore';
	import { goto } from '$app/navigation';

	const uploadId = $page.params.uploadId;

	let fileList = [];
	let loadingDone = false;

	onMount(() => {
		if (uploadId) {
			initFirebase();
			firebase
				.database()
				.ref('/files/' + uploadId)
				.once('value')
				.then((snapshot) => {
					fileList.push(snapshot.val());

					loadingDone = true;
				});
		}
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

	function handleLogout() {
		firebase.auth().signOut();
	}
</script>

<svelte:head>
	<title>vollsm.art - Download a file</title>
</svelte:head>

<div id="background">
	<div id="logo">
		<a href="/">vollsm.art</a>
	</div>

	<div id="user-info">
		{#if $authStore.isLoggedIn}
			<p title={'Logged in as ' + $authStore.user.email}>
				<small>Logged in as</small>
				<strong>{$authStore.user.displayName}</strong>
			</p>
			<button
				on:click={() => {
					goto('/account');
				}}
				title="Log out"
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
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/></svg
				>
			</button>
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
		{:else}
			<p>Not logged in</p>
			<button
				on:click={() => {
					goto('/account');
				}}
				title="Log in"
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
						d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
					/></svg
				>
			</button>
		{/if}
	</div>

	<div id="file-wrapper">
		<h1>File download</h1>
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
								{fileSizeString(file.size)} &hybull; uploaded {formatDateString(file.uploadedAt)} by
								{file.uploadedBy}
							</p>
						</div>
						<a href={`${BACKEND_URL}/files/${uploadId}/${file.name}`} target="_blank">
							<svg
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/></svg
							>
							<span>Download</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>No files found</p>
		{/if}
	</div>
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

		#file-wrapper {
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
					grid-template-columns: min-content auto min-content;
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
						background-color: #16a085;
						border-radius: 999px;
						text-decoration: none;
						color: white;
						display: flex;
						padding: 8px 16px;
						box-sizing: border-box;
						width: fit-content;
						margin-right: 4px;

						&:hover {
							background-color: #21c2a2;
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
	}
</style>
