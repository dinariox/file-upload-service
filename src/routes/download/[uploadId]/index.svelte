<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const BACKEND_URL = 'http://localhost:3100';
	const uploadId = $page.params.uploadId;

	let fileList = [];
	let loadingDone = false;

	onMount(() => {
		if (uploadId) {
			fetch(`${BACKEND_URL}/file/${uploadId}`)
				.then((res) => {
					return res.json();
				})
				.then((json) => {
					loadingDone = true;

					if (json.error) {
						console.error(json.error);
					} else if (json.files) {
						fileList = json.files;
					}
				});
		}
	});
</script>

<div id="background">
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
						<p>
							{file}
						</p>
						<a href={`${BACKEND_URL}/files/${uploadId}/${file}`} target="_blank">
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

					p {
						flex: auto;
						text-align: left;
						margin: 16px 8px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
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
