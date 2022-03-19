<script lang="ts">
	import axios from 'axios';

	const BACKEND_URL = 'http://localhost:3100';
	const FRONTEND_URL = 'http://localhost:3000';
	const MAXIMUM_FILE_SIZE_IN_BYTES = 1073741824; // 1GB

	let uploadStatus = 'ready';
	let uploadProgress = 0;
	let uploadURL = '';

	let copiedToClipboard = false;

	function uploadFile(file: File) {
		if (file.size > MAXIMUM_FILE_SIZE_IN_BYTES) {
			console.error('File is too large');
			return;
		}

		uploadStatus = 'uploading';

		let formData = new FormData();
		formData.append('file', file);
		axios
			.request({
				method: 'POST',
				url: BACKEND_URL + '/upload',
				data: formData,
				onUploadProgress: (progress) => {
					uploadProgress = progress.loaded / progress.total;
				}
			})
			.then((response) => {
				uploadProgress = 0;

				let json = response.data;
				if (json.error) {
					uploadURL = '';
					uploadStatus = 'error';
					console.error(json.error);
				} else if (json.uploadId) {
					uploadStatus = 'success';
					uploadURL = encodeURI(FRONTEND_URL + '/download/' + json.uploadId);
				} else {
					uploadURL = '';
					uploadStatus = 'error';
					console.error('Response does not contain a URL');
				}
			})
			.catch((error) => {
				uploadStatus = 'error';
				uploadProgress = 0;

				console.error(error);
			});
	}

	function handleClick(event: Event) {
		if (uploadStatus != 'ready') {
			return;
		}

		let fileInput: HTMLInputElement = document.getElementsByName('file')[0] as HTMLInputElement;
		fileInput.click();
	}

	function handleFileInputChange(event: Event) {
		let fileInput: HTMLInputElement = event.target as HTMLInputElement;
		let file = fileInput.files[0];
		if (file) {
			uploadFile(file);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (uploadStatus != 'ready') {
			return;
		}

		let file = event.dataTransfer.files[0];
		uploadFile(file);
	}

	function handleDragOver(event: Event) {
		event.preventDefault();

		let dropZone = document.getElementById('drop-zone');
		dropZone.style.borderColor = '#16a085';
	}

	function handleDragLeave(event: Event) {
		event.preventDefault();

		let dropZone = document.getElementById('drop-zone');
		dropZone.style.borderColor = '';
	}

	function handleCopyButtonClick() {
		navigator.clipboard.writeText(uploadURL);
		copiedToClipboard = true;
	}

	function handleReturnButtonClick() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>vollsm.art File Upload</title>
</svelte:head>
<div id="background">
	<div id="upload-wrapper">
		<h1>Upload your file</h1>
		<h2>
			Maximum file size is {MAXIMUM_FILE_SIZE_IN_BYTES / 1024 / 1024 / 1024} GB
		</h2>

		{#if uploadStatus == 'ready'}
			<div
				id="drop-zone"
				on:click={handleClick}
				on:drop={handleDrop}
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
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
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/></svg
				>
				<p>Drag and drop your file here or click to browse</p>
				<form id="file-upload-form">
					<input type="file" name="file" on:change={handleFileInputChange} />
				</form>
			</div>
		{:else if uploadStatus == 'uploading'}
			<div id="upload-progress-bar">
				<div id="upload-progress-bar-fill" style="width: {uploadProgress * 100}%" />
				<svg
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/></svg
				>
				<p id="upload-progress-text">{+(uploadProgress * 100).toFixed(1)}%</p>
			</div>
		{:else if uploadStatus == 'success'}
			<div id="upload-success">
				<svg
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<p>Your file has been uploaded successfully!</p>
				<div class="flex">
					<input type="text" value={uploadURL} disabled />
					<button on:click={handleCopyButtonClick}>
						<svg
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
							/></svg
						>
						<span>{copiedToClipboard ? 'Copied!' : 'Copy'}</span>
					</button>
				</div>
				<button id="return-button" on:click={handleReturnButtonClick}>Upload more</button>
			</div>
		{:else if uploadStatus == 'error'}
			<div id="upload-error">
				<p>An error occurred while uploading your file.</p>
				<button id="return-button" on:click={handleReturnButtonClick}>Try again</button>
			</div>
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

		#upload-wrapper {
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

			h2 {
				font-size: 1em;
				font-weight: 500;
				margin: 0px;
				margin-bottom: 32px;
				color: #714d69;
			}

			#drop-zone {
				background-color: #fff;
				border: 2px dashed #b1b1b1;
				border-radius: 16px;
				padding: 24px;
				margin-bottom: 24px;
				display: flex;
				flex-direction: column;
				align-items: center;
				color: #714d69;
				transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
					transform 0.2s ease-in-out;
				cursor: pointer;
				box-shadow: 0 0 16px rgba(0, 0, 0, 0.15);

				&:hover {
					border-color: #5c5c5c;
					box-shadow: 0 0 24px rgba(0, 0, 0, 0.2);
					transform: scale(1.01);
				}

				svg {
					width: 64px;
					height: 64px;
					margin-bottom: 12px;
				}

				p {
					margin: 0;
					user-select: none;
				}

				#file-upload-form {
					display: none;
				}
			}

			#upload-progress-bar {
				width: 100%;
				height: 48px;
				background: #fff;
				position: relative;
				border-radius: 16px;
				overflow: hidden;

				svg {
					width: 24px;
					height: 24px;
					position: absolute;
					left: 16px;
					top: 50%;
					transform: translateY(-50%);
				}

				#upload-progress-bar-fill {
					position: absolute;
					left: 0;
					top: 0;
					height: 100%;
					background-color: #16a085;
					transition: width 0.2s ease-in-out;
					z-index: 998;
				}

				#upload-progress-text {
					position: relative;
					top: 50%;
					transform: translateY(-50%);
					right: 16px;
					font-size: 1.25em;
					font-weight: 600;
					user-select: none;
					z-index: 999;
					margin: 0;
				}
			}

			#upload-success {
				background-color: #fff;
				border-radius: 16px;
				padding: 24px;
				margin-bottom: 24px;
				display: flex;
				flex-direction: column;
				align-items: center;
				color: #714d69;

				svg {
					width: 64px;
					height: 64px;
					margin-bottom: 12px;
					color: #16a085;
				}

				p {
					margin-top: 0;
					user-select: none;
				}
				.flex {
					display: flex;

					input {
						width: 100%;
						border: 2px solid #b1b1b1;
						border-radius: 16px;
						padding: 8px 12px;
						font-size: 1.25em;
						background-color: #f1f1f1;
						transition: background-color 0.2s ease-in-out;
						margin-right: 8px;
						cursor: text;

						&:hover {
							background-color: #e6e6e6;
						}
					}

					button {
						display: flex;
						background-color: #16a085;
						border: none;
						border-radius: 16px;
						color: white;
						padding: 0 16px;
						cursor: pointer;
						transition: background-color 0.2s ease-in-out;

						&:hover {
							background-color: #21c2a2;
						}

						svg {
							width: 24px;
							height: 24px;
							margin-right: 4px;
							position: relative;
							top: 50%;
							transform: translateY(-50%);
							color: white;
						}

						span {
							font-size: 1.5em;
							font-weight: 500;
							position: relative;
							top: 50%;
							transform: translateY(-50%);
						}
					}
				}
			}

			#upload-error {
				display: flex;
				flex-direction: column;
				align-items: center;

				p {
					margin-bottom: 0;
				}
			}
		}
	}
	#return-button {
		display: flex;
		background-color: #af4154;
		border: none;
		border-radius: 16px;
		color: white;
		padding: 12px 20px;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		font-size: 1.25em;
		font-weight: 500;
		margin-top: 24px;

		&:hover {
			background-color: #d1455c;
		}
	}
</style>
